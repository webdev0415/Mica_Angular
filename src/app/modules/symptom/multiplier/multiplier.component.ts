import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  forwardRef,
  EventEmitter,
  Output
} from "@angular/core";
import {
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  FormControl,
  Validators,
  Validator
} from "@angular/forms";
import {Observable, Subscription} from "rxjs";
import {select, NgRedux} from "@angular-redux/store";
import * as _ from "lodash";
import {ApiService} from "../services/api.service";
import {DataService} from "../services/data.service";
import {multiplierValidator} from "./multiplier.validator";
import {externalMultiplierOptions, typeaheadItems} from "../../../state/symptoms/symptoms.selectors";
import {SET_MULTIPLIER_DATA} from "../../../state/symptoms/symptoms.actions";
import {of} from "rxjs/observable/of";
import {tap, map, distinctUntilChanged} from "rxjs/operators";
import DataStoreRefTypeValue = Workbench.DataStoreRefTypeValue;

@Component({
  selector: "mica-multiplier",
  templateUrl: "./multiplier.component.html",
  styleUrls: ["./multiplier.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiplierComponent),
      multi: true
    }, {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MultiplierComponent),
      multi: true
    }
  ]
})
export class MultiplierComponent implements OnInit, OnDestroy, ControlValueAccessor, Validator {
  @Input() readonly symptomData: Symptom.Data;
  @Input() readOnly = false;
  @Input() multiplierDataStore: Workbench.DataStoreRefType;
  @Input() allMultiplierValues: (string[] | [number, number])[];
  @Input() removable: boolean;
  @Input() rowIndex: number;
  @Input() hasBodySelector: boolean;
  @Output() removeRow: EventEmitter<boolean> = new EventEmitter();
  @Output() toggleDescriptor: EventEmitter<boolean> = new EventEmitter();
  @select(["nav", "activeDescriptors"]) activeDescriptors$: Observable<State.ActiveDescriptors>;
  loadingData: boolean;
  descriptorToggled: Observable<boolean>;
  private subs: Subscription[] = [];

  ctrlSingle = new FormControl(""); // secondary control when there's only one value
  ctrlMultiple: FormControl = new FormControl([], [Validators.required, multiplierValidator]);

  propagateChange = (_: any) => {
  };

  registerOnChange(fn: (_: any) => {}) {
    this.propagateChange = fn;
  }

  registerOnTouched() {
    if (this.ctrlMultiple.errors) this.ctrlMultiple.updateValueAndValidity()
  }

  writeValue(value: string[]) {
    if (value !== undefined) this.ctrlMultiple.setValue(value);
  }

  validate(c: FormControl) {
    return this.ctrlMultiple.errors
  }

  get state() {
    return this.store.getState()
  }

  get title() {
    return this.multiplierDataStore.title;
  }

  get selectables() {
    return this.multiplierDataStore.values;
  }

  get isSingle() {
    return _.isArray(this.ctrlMultiple.value) && this.ctrlMultiple.value.length === 1
  }

  get antithesis(): Array<number> | null {
    const cacheObj = {} as any;
    const selectables = this.selectables || [];
    const multiplierValues = this.ctrlSingle.value ? this.ctrlSingle.value.split(",") : [];
    const antithesises = selectables.reduce((resultArray: Array<string>, selectable: DataStoreRefTypeValue) => {
      for (let i = 0; i < multiplierValues.length; i++) {
        const multiplierValue = multiplierValues[i].toUpperCase();
        const selectableValue = (selectable.value || "").toUpperCase();
        const selectableName = selectable.name.toUpperCase();
        const antithesis = selectable.m_antithesis;
        if ((selectableName === multiplierValue
          || selectableValue === multiplierValue)
          && !cacheObj[antithesis]) {
          cacheObj[antithesis] = antithesis;
          resultArray.push(antithesis as any);
        }
      }
      return resultArray;
    }, [] as any);
    return antithesises.length ? antithesises : null;
  }

  constructor(private cd: ChangeDetectorRef,
              private store: NgRedux<State.Root>,
              private data: DataService,
              private api: ApiService) {
  }

  ngOnInit() {
    if (!this.multiplierDataStore) throw Error("Missing multiplierDataStore input");

    this.subs.push(this.ctrlMultiple.valueChanges
      .pipe(
        distinctUntilChanged((x, y) => _.isEqual(x, y))
      )
      .subscribe(v => {
        if (this.isSingle && v[0] !== this.ctrlSingle.value) this.ctrlSingle.setValue(v[0]);
        this.propagateChange(v);
      }));

    this.subs.push(this.ctrlSingle.valueChanges.subscribe(v => this.ctrlMultiple.setValue([v])));

    this.descriptorToggled = this.descriptorFile || this.hasBodySelector
      ? this.data.isActiveDescriptor$(this.symptomData.symptomID, this.rowIndex)
      : of(false);
  }

  ngOnDestroy() {
    _.each(this.subs, sub => sub.unsubscribe());
  }

  get descriptorFile(): string {
    return _.get(this.symptomData, ["symptomsModel", "descriptorFile"]) || "";
  }

  get rangeValues(): [number, number] {
    return <[number, number]>_.get(this.symptomData, ["symptomsModel", "rangeValues"]);
  }

  /**
   * EVENT LISTENERS
   */

  onSelectRegion(value: [string, string, string]) {
    this.ctrlMultiple.setValue(value);
  }

  onToggleDescriptor() {
    this.toggleDescriptor.emit(true);
  }

  /**
   * CHILDREN INPUTS
   */

  get multiplierType(): string {
    const ds = this.multiplierDataStore;
    if (this.descriptorFile || this.hasBodySelector) return "pop-up";
    if (this.getTypeaheadOptions(this.multiplierDataStore.title)) return "typeahead";
    if (this.rangeValues) return "ranger";
    if (ds.title === "Geography") return "country";
    if (ds && ds.values && ds.values.length) return "dropdown";
    return "input";
  }

  get multiplierTypeaheadType(): string {
    const options = this.getTypeaheadOptions(this.multiplierDataStore.title);
    return options ? options.type : "";
  }

  get multiplierSearchName(): Observable<string> {
    return this.multiplierItems
      .pipe(
        map(n => {
          const options = this.getTypeaheadOptions(this.multiplierDataStore.title);
          return options && options.type === "liveSearch" ? options.searchName : "";
        })
      );
  }

  get multiplierItems(): Observable<MICA.SelectableEl[]> {
    const options = this.getTypeaheadOptions(this.multiplierDataStore.title);
    if (!options || options.type === "liveSearch") return of([]);
    return typeaheadItems(options.dataStoreRefTypeName)(this.state)
      ? this.store.select(typeaheadItems(options.dataStoreRefTypeName))
      : this.api.typeAheadValues$(options.dataStoreRefTypeName, options.url)
        .pipe(
          tap(items => {
            this.store.dispatch({
              type: SET_MULTIPLIER_DATA,
              key: options.dataStoreRefTypeName,
              values: items
            });
            this.loadingData = false;
          })
        )
  }

  private getTypeaheadOptions(dataStoreRefTypeName: string): State.ExternalMultiplier | undefined {
    return _.find(externalMultiplierOptions(this.state), {dataStoreRefTypeName});
  }
}
