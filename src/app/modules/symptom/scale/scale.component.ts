import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  ChangeDetectorRef, SimpleChanges, OnChanges,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Subscription, BehaviorSubject } from "rxjs";
import * as _ from "lodash";
import { distinctUntilChanged, skip } from "rxjs/operators";
import { TimeRange } from "../../../util/data/illness";
import { formCtrlErrorTracker } from "../../../util/forms/errors";

@Component({
  selector: "mica-scale",
  templateUrl: "./scale.component.html",
  styleUrls: ["./scale.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScaleComponent implements OnInit, OnDestroy, OnChanges {
  @Input() readOnly = false;
  @Input() symptomsModel: Symptom.Model;
  @Input() symptomData: Symptom.Data;
  @Input() scaleDataStore: Workbench.DataStoreRefTypesDictionary;
  @Input() scaleFormGroup: FormGroup;
  @Input() alwaysControlIsVisible: boolean;
  @Input() validTimeRanges: { [timeFrame: string]: TimeRange };
  @Input() selectedTimeRanges: { [likelihood: string]: { [timeFrame: string]: TimeRange } };
  @Input() modifierIndex: number;
  @Input() likelihood: string;
  @Output() error: EventEmitter<Symptom.ScaleError> = new EventEmitter();

  slopeValues: string[];
  private currentSelectedRanges: { [timeFrame: string]: TimeRange } = {};
  private errorPublisherSrc: BehaviorSubject<Symptom.ScaleError> = new BehaviorSubject({});
  private errorPublisher = this.errorPublisherSrc.asObservable();
  private requiredInputs = ["symptomsModel", "scaleFormGroup", "scaleDataStore"];
  private subs: Subscription[] = [];

  constructor(private cd: ChangeDetectorRef) {
  }

  get timeFrameControl(): FormControl {
    return this.scaleFormGroup.get("timeFrame") as FormControl;
  }

  get isAlwaysSet(): boolean {
    return Object.keys(this.currentSelectedRanges).length === Object.keys(this.validTimeRanges).length;
  }

  get scaleValidationClass() {
    return this.scaleFormGroup.valid ? "has-success" : "has-warning";
  }

  get visibleRanges(): TimeRange[] {
    return Object.keys(this.validTimeRanges).map(key => this.validTimeRanges[key]);
  }

  get anyRangeAvailable(): boolean {
    return Object.values(this.validTimeRanges).reduce((res, range) => {
      return res || this.rangeAvailable(range);
    }, false);
  }

  /**
   * Checks if there are any other scales with selected time ranges.
   * If there are, returns false
   **/
  get isAlwaysCtrlVisible(): boolean {
    const selectedLikelihoodTimeRanges = this.selectedLikelihoodTimeRanges;
    const currentSelectedRanges = (this.currentSelectedRanges && Object.keys(this.currentSelectedRanges)) || [];
    const allSelectedRanges = (selectedLikelihoodTimeRanges && Object.keys(selectedLikelihoodTimeRanges)) || [];

    return this.alwaysControlIsVisible && !(currentSelectedRanges.length < allSelectedRanges.length);
  }

  ngOnInit() {
    if ((this.scaleFormGroup).contains("value")) {
      (this.scaleFormGroup).removeControl("value")
    }

    if (!((this.scaleFormGroup).contains("timeFrame"))) {
      (this.scaleFormGroup).addControl("timeFrame", new FormControl(""))
    }

    this.timeFrameControl.setValidators(Validators.required);
    _.each(this.requiredInputs, ri => {
      if (!_.get(this, ri)) throw Error("ScaleComponent requires: " + ri);
    });

    this.slopeValues = _.map(this.scaleDataStore["Slope"].values, v => v.name);

    this.subs.push(
      this.errorPublisher.pipe(
        distinctUntilChanged((x, y) => _.isEqual(x, y)),
        skip(1)
      ).subscribe(this.onError.bind(this))
    );

    this.setCurrentSelectedRanges();
    this.subs.push(formCtrlErrorTracker("timeFrame", this.scaleFormGroup.get("timeFrame") as FormControl, this.errorPublisherSrc));
  }

  ngOnChanges(changes: SimpleChanges) {
    const { likelihood, selectedTimeRanges } = changes;

    if (likelihood && selectedTimeRanges && !likelihood.isFirstChange()) {
      const { currentValue: currentLikelihood } = likelihood;
      const { previousValue: prevRanges } = selectedTimeRanges;
      const prevLikelihoodRanges = prevRanges && prevRanges[currentLikelihood];

      if (prevLikelihoodRanges) {
        Object.keys(prevLikelihoodRanges).forEach(rangeName => {
          delete this.currentSelectedRanges[rangeName];
        });
      }

      this.timeFrameControl.setValue(Object.keys(this.currentSelectedRanges).join(","));
      this.setTimeFrameValidity();
    }
  }

  ngOnDestroy() {
    _.each(this.subs, s => s.unsubscribe());
  }

  onAlwaysClick() {
    if (this.isAlwaysSet) {
      this.currentSelectedRanges = {};
    } else {
      this.currentSelectedRanges = {...this.validTimeRanges};
    }

    this.timeFrameControl.setValue(Object.keys(this.currentSelectedRanges).join(","));
    this.setTimeFrameValidity();
  }

  rangeAvailable(rangeToCheck: TimeRange): boolean {
    const rangeName = rangeToCheck.name;
    const isSelected = !!this.selectedLikelihoodTimeRanges[rangeName];
    const isSelectedInRow = !!this.currentSelectedRanges[rangeName];

    return !isSelected || isSelectedInRow;
  }

  toggleRange(rangeToToggle: TimeRange) {
    const rangeName = rangeToToggle.name;
    const foundRange = this.currentSelectedRanges[rangeName];

    if (foundRange) {
      delete this.currentSelectedRanges[rangeName];
    } else {
      this.currentSelectedRanges[rangeName] = this.validTimeRanges[rangeName];
    }

    this.timeFrameControl.setValue(Object.keys(this.currentSelectedRanges).join(","));
    this.setTimeFrameValidity();
  }

  private get selectedLikelihoodTimeRanges() {
    return this.selectedTimeRanges && this.selectedTimeRanges[this.likelihood] || {};
  }

  private onError = (scaleError: Symptom.ScaleError) => this.error.emit(scaleError);

  private setTimeFrameValidity() {
    const keys = Object.keys(this.currentSelectedRanges);
    let min = 0;
    let max = 0;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const currentCount = this.currentSelectedRanges[key].count;

      if (i === 0) {
        min = currentCount;
      } else {
        if (currentCount < min) min = currentCount;
      }

      if (currentCount > max) max = currentCount;
    }

    const valid = (max - min) === (keys.length - 1);

    if (valid) {
      const {
        hasInvalidRange,
        ...withoutInvalidRangeError
      } = this.timeFrameControl.errors as any || { hasInvalidRange: null };

      this.timeFrameControl.setErrors(withoutInvalidRangeError);
      this.timeFrameControl.updateValueAndValidity();
    } else {
      this.timeFrameControl.setErrors({ hasInvalidRange: true });
    }

    this.cd.markForCheck();
  }

  private setCurrentSelectedRanges() {
    const timeFrameArray: string[] = this.timeFrameControl.value.split(",");
    const selectedRanges: { [key: string]: TimeRange } = {};

    timeFrameArray.forEach(rangeName => {
      const range = rangeName && this.validTimeRanges[rangeName];

      if (range) {
        selectedRanges[rangeName] = range;
      }
    });
    this.currentSelectedRanges = selectedRanges;
  }

}
