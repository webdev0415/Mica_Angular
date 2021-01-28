import { activeSymptomGroup } from "app/state/nav/nav.selectors";
import { Component, Input, ChangeDetectorRef, OnDestroy, OnInit, ChangeDetectionStrategy, Output, EventEmitter } from "@angular/core";
import { trigger, state, style, transition, animate } from "@angular/animations";
import { Subscription, Observable, BehaviorSubject } from "rxjs";
import { NgRedux } from "@angular-redux/store";
import { FormArray, FormControl, FormGroup, AbstractControl } from "@angular/forms";
import * as _ from "lodash";
import { optimizeSymptomValue, processSymptomValue, symptomRowFactory } from "./symptom.factory";
import { formGroupFactory } from "app/util/forms/create";
import * as workbenchSelectors from "app/state/workbench/workbench.selectors";
import {
  completeSymptomGroup, insertSymptom, saveSymptom, deleteSymptom, setSymptomError,
  deleteMandatorySymptom, setMandatorySymptom
} from "app/state/workbench/workbench.actions";
import {
  dataStoreRefTypesByGroup,
  symptomDataPath,
  symptomData,
} from "app/state/symptoms/symptoms.selectors";
import { wrapState } from "app/state/state.store";
import { symptomValueFactory } from "./symptom.factory";
import { bodyPartsValidator } from "app/util/forms/validators";
import { formCtrlErrorTracker } from "app/util/forms/errors";
import { removeEcwValidationSymptom, addEcwValidationSymptom } from "app/state/ecw/ecw.actions";
import { from } from "rxjs/observable/from";
import { debounceTime, distinctUntilChanged, skip, filter, take } from "rxjs/operators";
import RowValue = Symptom.RowValue;

@Component({
  animations: [
    trigger("slideInOutQuick", [
      state("true", style({
        opacity: 1,
        transform: "translateY(0)"
      })),
      transition("void => *", [
        style({
          opacity: 0,
          transform: "translateY(-50%)"
        }),
        animate("0.3s ease-out")
      ]),
      transition("* => void", [
        animate("0.3s ease-in", style({
          opacity: 0,
          transform: "translateY(-100%)"
        }))
      ])
    ])
  ],
  selector: "mica-symptom",
  templateUrl: "./symptom.component.html",
  styleUrls: ["./symptom.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SymptomComponent implements OnDestroy, OnInit {
  @Input() readonly symptomID: string;
  @Input() readOnly = false;
  @Input() bodyParts: string[] = [];
  @Input() bodyPartsAll: string[] = [];
  @Input() indexVal: number;
  @Input() basicSymptomID: string;
  @Input() nlpSymptom = false;

  @Output() focus: EventEmitter<string> = new EventEmitter();

  symptomData: Symptom.Data;
  symptomFormGroup: FormGroup | null = null;
  showQ = false;

  private dataPath: Symptom.LocationData;
  private dataStoreRefTypes: Workbench.DataStoreRefTypesDictionary;
  private value$: Observable<Symptom.Value | undefined>;
  private requiredInputs = ["symptomID"];
  private ngFormSub: Subscription | null;
  private init = false;
  private subs: Subscription[] = [];
  private errorPublisherSrc: BehaviorSubject<Symptom.RootError> = new BehaviorSubject({});
  private errorPublisher = from(this.errorPublisherSrc);
  private test = false;

  constructor(private cd: ChangeDetectorRef,
              private s: NgRedux<State.Root>) {
  }

  get isChecked(): boolean {
    return !!this.symptomFormGroup;
  };

  get bodyPartsValue(): string[] {
    const bodyPartsCtrl = this.symptomFormGroup ? this.symptomFormGroup.get("bodyParts") : undefined;
    return this.bodyPartsAll.length > 1 && bodyPartsCtrl ? bodyPartsCtrl.value : [];
  }

  get maxRowsReached(): boolean | number {
    if (!this.rowsCtrl) {
      return false;
    }

    const values = this.rowsCtrl.value;
    const numSetMultiplierValues = values.reduce((sum: number, value: RowValue) => {
      const multipliers = value.multiplier;
      let numCurrentMultipliers = 0;
      if (multipliers && multipliers.length) {
        if (multipliers.length === 1 && typeof multipliers[0] === "string") {
          numCurrentMultipliers = (multipliers[0] as string).split(",").length;
        } else {
          numCurrentMultipliers = multipliers.length;
        }
      }
      return sum + numCurrentMultipliers;
    }, 0);

    return numSetMultiplierValues > this.maxRows
      ? numSetMultiplierValues - this.maxRows
      : numSetMultiplierValues === this.maxRows;
  }

  ngOnInit() {
    this.dataPath = symptomDataPath(this.symptomID, null, this.nlpSymptom)(this.state);
    this.dataStoreRefTypes = dataStoreRefTypesByGroup(this.dataPath.symptomGroup)(this.state);

    _.each(this.requiredInputs, ri => {
      if (!_.get(this, ri)) throw Error("SymptomComponent required: " + ri);
    });
    // if (this.nlpSymptom)
    // this.symptomData = nlpSymptomData(this.symptomID)(this.state);
    this.symptomData = symptomData(this.symptomID)(this.state);

    this.value$ = this.s.select(workbenchSelectors.symptomValue(this.symptomData.symptomID));

    this.subs.push(
      this.errorPublisher.pipe(
        skip(1), // skip default value
        distinctUntilChanged((x, y) => _.isEqual(x, y))
      ).subscribe(rootError => {
        this.onPublishError(rootError);
      })
    );

    this.value$.pipe(
      distinctUntilChanged(this.valuesAreEqual),
      filter(this.filterValues.bind(this)),
      take(1),
    ).subscribe(this.onSymptomValue.bind(this));

    this.init = true;
  }

  ngOnDestroy() {
    if (this.ngFormSub) this.ngFormSub.unsubscribe();
    _.each(this.subs, s => s.unsubscribe());
  }

  onAddRow(): void {
    if (this.readOnly) return;
    if (this.rowsCtrl && this.rowsCtrl.length < this.maxRows) {
      const rowValues = symptomRowFactory(this.symptomData, this.state);
      if (!rowValues) return;
      this.rowsCtrl.push(formGroupFactory(rowValues, this.s.getState()));
      this.cd.detectChanges();
    }
  }

  onToggleBodyPart(part: string): void {
    if (this.readOnly) return;

    const ctrl = this.symptomFormGroup ? this.symptomFormGroup.get("bodyParts") : undefined;

    if (!ctrl) {
      console.error("Symptom not configured for bodyParts");
      return;
    }

    ctrl.setValue(this.toggleBodyPartValue(part, ctrl.value, this.bodyPartsAll));
  }

  onCheck(checked: boolean) {
    if (this.readOnly) return;

    const { symptomID, categoryID, symptomGroup } = this.dataPath;

    if (checked) {
      this.test = false;
      this.s.dispatch(wrapState(insertSymptom(
        symptomValueFactory(this.symptomData, this.bodyParts, this.state),
        this.dataPath
      )) as any);
      this.s.dispatch(removeEcwValidationSymptom(symptomID, categoryID, symptomGroup))
    } else {
      this.test = true;
      this.s.dispatch(deleteSymptom(symptomID, this.dataPath));

      if (!this.nlpSymptom) {
        this.s.dispatch(addEcwValidationSymptom(symptomID, categoryID, symptomGroup));
      }

      this.value$.pipe(
        skip(1),
        distinctUntilChanged(),
        take(1)
      ).subscribe(this.onSymptomValue.bind(this));

      this.showQ = false;
    }

    this.value$.pipe(take(1)).subscribe(this.onSymptomValue.bind(this));

    this.onSymptomValueChange();
  }

  onSymptomError(rowErrors: Symptom.RowError[] | null, root: Symptom.RootError | null): void {
    const error: Symptom.ValueError = {
      symptomID: this.symptomData.symptomID,
      name: this.symptomData.name,
      bodyParts: root && root.bodyParts ? root.bodyParts : null,
      groupID: activeSymptomGroup(this.state),
      rowErrors: rowErrors
    };

    this.s.dispatch(setSymptomError(error));
  }


  private get rowsCtrl(): FormArray | undefined {
    return this.symptomFormGroup ? this.symptomFormGroup.get("rows") as FormArray : undefined;
  }

  private get state() {
    return this.s.getState();
  }

  private addBodyPartsTracker(bodyPartsCtrl: AbstractControl | null | undefined) {
    if (!bodyPartsCtrl) return;
    this.subs.push(formCtrlErrorTracker("bodyParts", bodyPartsCtrl, this.errorPublisherSrc));
  }

  /**
   *
   * @param formGroup
   * @param skipVal It has two functions:
   * - It avoids dispatching on first load if symptom has saved data
   * - It skips on first load to avoid marking symptom group as non complete if it's saved as complete
   */
  private valueSub(formGroup: FormGroup, skipVal: number): Subscription {
    return formGroup.valueChanges.pipe(
      debounceTime(200),
      skip(skipVal)
    ).subscribe(this.onFormValueChange.bind(this));
  }

  private get maxRows(): number {
    const multiplierName = this.symptomData.multipleValues;

    if (!multiplierName) return 1;
    try {
      const refType = this.dataStoreRefTypes[multiplierName];
      if (!refType || !refType.values || !refType.values.length) return 10000;
      return refType.values.length;
    } catch (error) {
      throw Error("[symptomComponent] Unable to determine refType for maxRows. " + error);
    }
  }

  private toggleBodyPartValue(value: string, active: string[], all: string[]): string[] {
    return !~_.indexOf(active, value)
      ? _.concat(active, [value])
      : _.without(active.length === 1 ? all : active, value);
  }

  private onSymptomValueChange(): void {
    if (workbenchSelectors.isSymptomGroupActiveComplete(this.state)) {
      this.s.dispatch(completeSymptomGroup(
        activeSymptomGroup(this.state),
        false
      ));
    }
  }

  private onFormValueChange(v: Symptom.Value) {
    if (this.readOnly) return;

    if (!this.rowsCtrl || !this.rowsCtrl.length) {
      // add a row if there's none
      this.onAddRow();
    } else if (this.symptomFormGroup && this.bodyParts.length && !this.symptomFormGroup.get("bodyParts")) {
      this.test = true;
      // add bodyParts
      this.symptomFormGroup.addControl("bodyParts", new FormControl(this.bodyParts, bodyPartsValidator));
      this.addBodyPartsTracker(this.symptomFormGroup.get("bodyParts"));
    } else {
      this.test = true;
      // save value
      this.s.dispatch(saveSymptom(optimizeSymptomValue(_.cloneDeep(v), this.state)));
      this.onSymptomValueChange();
    }
  }

  private onPublishError(rootError: Symptom.RootError) {
    const root = !_.isEmpty(rootError) ? rootError : { bodyParts: {} };

    this.onSymptomError(null, root);
  };

  private valuesAreEqual = (x: any, y: any) => _.isEqual(x, y);

  private onSymptomValue(v: Symptom.Value) {
    const transformedV = v && processSymptomValue(v);

    if (transformedV && this.basicSymptomID) {
      // enforce the basic symptom
      this.s.dispatch(setMandatorySymptom(
        this.symptomID,
        this.basicSymptomID,
        activeSymptomGroup(this.state)
      ));

      const basicSymptomValue = workbenchSelectors.symptomValue(this.basicSymptomID)(this.state);

      if (!basicSymptomValue) {
        const basicSymptomData: Symptom.Data = symptomData(this.basicSymptomID)(this.state);
        const basicDataPath = symptomDataPath(this.basicSymptomID)(this.state);

        this.s.dispatch(wrapState(insertSymptom(
          symptomValueFactory(basicSymptomData, this.bodyParts, this.state),
          basicDataPath
        )) as any);

        this.s.dispatch(removeEcwValidationSymptom(
          this.basicSymptomID,
          basicDataPath.categoryID,
          activeSymptomGroup(this.state)
        ));
      }
    }

    if (transformedV && !this.symptomFormGroup) {
      // symptom has been checked internally
      // group similar rows that have multipliers

      this.symptomFormGroup = formGroupFactory(transformedV, this.state) as FormGroup;

      this.ngFormSub = this.valueSub(this.symptomFormGroup, this.init ? 0 : 1);
      this.addBodyPartsTracker(this.symptomFormGroup.get("bodyParts"));

    } else if (!transformedV) {
      // symptom has been deleted either externally or internally
      this.symptomFormGroup = null;

      if (this.basicSymptomID) {
        this.s.dispatch(deleteMandatorySymptom(this.symptomID, activeSymptomGroup(this.state)));
      }

      if (this.ngFormSub) this.ngFormSub.unsubscribe();
      this.ngFormSub = null;

    } else if (this.symptomFormGroup && !_.isEqual(transformedV, this.symptomFormGroup.value)) {
      // symptom has been added externally
      if (this.ngFormSub) this.ngFormSub.unsubscribe();

      this.symptomFormGroup = formGroupFactory(transformedV, this.state) as FormGroup;
      this.ngFormSub = this.valueSub(this.symptomFormGroup, this.init ? 0 : 1);
      this.addBodyPartsTracker(this.symptomFormGroup.get("bodyParts"));
    }

    if (this.readOnly && this.symptomFormGroup) this.symptomFormGroup.disable();
    this.cd.markForCheck();
  }

  private filterValues = (val: any, index: number) => index > 1 || !!val || this.isChecked;

}
