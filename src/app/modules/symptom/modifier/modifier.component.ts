import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnDestroy
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormArray,
  Validators
} from "@angular/forms";
import * as _ from "lodash";
import { defaultModifierValue } from "../symptom.factory";
import { formGroupFactory } from "app/util/forms/create";
import { NgRedux } from "@angular-redux/store";
import { Subscription, BehaviorSubject } from "rxjs";
import { compactErrorCollection } from "app/util/forms/errors";
import { from } from "rxjs/observable/from";
import { distinctUntilChanged, pairwise } from "rxjs/operators";
import { getSelectedRanges, TimeRange } from "app/util/data/illness";
import { validTimeRanges } from "app/state/symptoms/symptoms.selectors";


@Component({
  selector: "mica-modifier",
  templateUrl: "./modifier.component.html",
  styleUrls: ["./modifier.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModifierComponent implements OnInit, OnDestroy {
  @Input() readOnly = false;
  @Input() readonly symptomData: Symptom.Data;
  @Input() readonly dataStoreRefTypes: Workbench.DataStoreRefTypesDictionary;
  @Input() modifierCtrlArray: FormArray;
  @Input() alwaysControlIsVisible: boolean;
  @Output() errors: EventEmitter<Symptom.ModifierError[]> = new EventEmitter();

  private subs: Subscription[] = [];
  private errorsPublisherSrc: BehaviorSubject<Symptom.ModifierError[]> = new BehaviorSubject([]);

  errorsPublisher = from(this.errorsPublisherSrc);
  modifierNames: MICA.SelectableEl[] = [
    {
      name: "Time",
      value: "Time"
    },
    {
      name: "Ethnicity",
      value: "Ethnicity"
    },
    {
      name: "Recurs",
      value: "Recurs"
    }
  ];
  selectedTimeRanges: { [likelyhood: string]: { [timeFrame: string]: TimeRange } } = {};

  constructor(private s: NgRedux<State.Root>) {
  }

  get validTimeRanges(): { [timeFrame: string]: TimeRange } {
    return validTimeRanges(this.state);
  };

  get allModifierNameValues(): string[] {
    return _.map(<Symptom.ModifierValue[]>this.modifierCtrlArray.value, v => v.name);
  }

  areMoreRowsAllowed(modifierIdx: number) {
    return modifierIdx === this.modifierCtrlArray.controls.length - 1;
  }

  onAddRow(index: number): void {
    if (this.readOnly) return;

    const ctrlValue: Symptom.ModifierValue = this.modifierCtrlArray.at(index).value;
    const ctrlName = ctrlValue.name;
    const value = defaultModifierValue(this.symptomData, ctrlName, this.state);
    let ctrl: FormGroup;

    if (ctrlValue.scale && ctrlValue.scale.value) {
      value.scale = _.cloneDeep(ctrlValue.scale);
      value.scale.value = "";
      value.scale.scaleTimeLimitStart = 0;
      value.scale.upperTimeLimit = 0;
    }

    ctrl = <FormGroup>formGroupFactory(value, this.state);

    if (ctrlValue.name === "Ethnicity" || ctrlValue.name === "Recurs") {
      ctrl.addControl("modifierValue", new FormControl("", Validators.required));
      if (ctrl.get("scale")) {
        ctrl.removeControl("scale");
      }
    }

    this.modifierCtrlArray.push(ctrl);
  }

  onRemoveRow(index: number): void {
    if (this.readOnly) return;

    this.modifierCtrlArray.removeAt(index);
    this.errorsPublisherSrc.next(_.reduce(this.errorsPublisherSrc.value, (errors, err) => {
      if (err.index === index) return errors;
      if (err.index > index) return [ ...errors, { ...err, index: err.index - 1 } ];

      return [...errors, err];
    }, [] as Symptom.ModifierError[]));
  }

  onModifierError(error: Symptom.ModifierError, index: number): void {
    compactErrorCollection(error, index, this.errorsPublisherSrc);
  }

  ngOnInit() {
    this.subs.push(
      this.errorsPublisher.pipe(
        distinctUntilChanged((x, y) => _.isEqual(x, y))
      ).subscribe(errs => this.errors.emit(errs)),

      this.modifierCtrlArray.valueChanges.pipe(
        distinctUntilChanged((x, y) => _.isEqual(x, y)),
        pairwise(),
      ).subscribe(this.setSelectedRanges.bind(this))
    );
    this.setSelectedRanges();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  private get state() {
    return this.s.getState()
  }

  private setSelectedRanges() {
    this.selectedTimeRanges = getSelectedRanges(this.modifierCtrlArray.value, this.validTimeRanges);
  }

}
