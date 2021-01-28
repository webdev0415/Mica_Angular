import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from "@angular/core";
import { AbstractControl, FormControl, FormGroup, Validators } from "@angular/forms";
import { Subscription, BehaviorSubject } from "rxjs";
import * as _ from "lodash";
import { defaultScaleValue } from "../../symptom.factory";
import { formGroupFactory } from "../../../../util/forms/create";
import { NgRedux } from "@angular-redux/store";
import { formCtrlErrorTracker } from "../../../../util/forms/errors";
import { distinctUntilChanged, skip } from "rxjs/operators";
import { TimeRange } from "../../../../util/data/illness";

@Component({
  selector: "mica-modifier-row",
  templateUrl: "./modifier-row.component.html",
  styleUrls: ["./modifier-row.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModifierRowComponent implements OnInit, OnDestroy {
  @Input() readOnly = false;
  @Input() readonly symptomData: Symptom.Data;
  @Input() readonly dataStoreRefTypes: Workbench.DataStoreRefTypesDictionary;
  @Input() readonly modifierCtrl: FormGroup;
  @Input() readonly allModifierNames: string[];
  @Input() readonly modifierNames: MICA.SelectableEl[];
  @Input() readonly removable: boolean;
  @Input() readonly moreRowsAllowed: boolean;
  @Input() modifierIndex: number;
  @Input() alwaysControlIsVisible: boolean;
  @Input() selectedTimeRanges: { [likelihood: string]: { [timeFrame: string]: TimeRange } };
  @Input() validTimeRanges: { [timeFrame: string]: TimeRange };

  @Output() readonly addRow: EventEmitter<boolean> = new EventEmitter();
  @Output() readonly removeRow: EventEmitter<boolean> = new EventEmitter();
  @Output() error: EventEmitter<Symptom.ModifierError | {}> = new EventEmitter();

  private errorPublisherSrc: BehaviorSubject<Symptom.ModifierError> = new BehaviorSubject({
    name: "",
    index: -1
  });
  private errorPublisher = this.errorPublisherSrc.asObservable();
  private modifierValueSub: Subscription;
  private subs: Subscription[] = [];

  constructor(private s: NgRedux<State.Root>,
              private cd: ChangeDetectorRef) {
  }

  get modifierNameCtrl() {
    return this.modifierCtrl.get("name") as FormControl;
  }

  get scaleCtrl(): FormGroup {
    return <FormGroup>this.modifierCtrl.get("scale");
  }

  get likelihoodCtrl(): FormGroup {
    return <FormGroup>this.modifierCtrl.get("likelihood");
  }

  get modifierName(): Symptom.ModifierType {
    return this.modifierNameCtrl.value;
  }

  get hasEthnicity() {
    return this.modifierName === "Ethnicity" && !!this.modifierCtrl.get("modifierValue");
  }

  get hasRecurs() {
    return this.modifierName === "Recurs" && !!this.modifierCtrl.get("modifierValue");
  }

  get ethnicityDataStore() {
    return this.dataStoreRefTypes["Ethnicity"].values;
  }

  get recursDataStore() {
    return this.dataStoreRefTypes["Recurs"].values;
  }

  get scaleDataStore() {
    return _.pick(this.dataStoreRefTypes, ["TimeUnit", "Slope"]) as Workbench.DataStoreRefTypesDictionary;
  }

  ngOnInit() {
    this.subs.push(
      this.errorPublisher.pipe(
        distinctUntilChanged((x, y) => _.isEqual(x, y)),
        skip(2)
      ).subscribe(this.onPublishError.bind(this)),

      this.modifierNameCtrl.valueChanges.pipe(
        distinctUntilChanged(),
        skip(1)
      ).subscribe(this.onModifierNameChange.bind(this)),

      this.modifierNameCtrl.valueChanges.pipe(
        distinctUntilChanged(),
      ).subscribe(this.onModifierNameCtrlChange.bind(this)),
    );

    this.checkLikelihood(this.modifierCtrl.get("likelihood") as AbstractControl);
    this.checkModifier(this.modifierCtrl.get("modifierValue") as AbstractControl);
    this.subs.push(formCtrlErrorTracker("scaleTimeLimitStart", this.modifierNameCtrl, this.errorPublisherSrc));
  }

  ngOnDestroy() {
    _.each(this.subs, s => s.unsubscribe());
    if (this.modifierValueSub) this.modifierValueSub.unsubscribe();
  }

  onScaleError(scale: Symptom.ScaleError): void {
    this.errorPublisherSrc.next(_.isEmpty(scale)
      ? _.omit(this.errorPublisherSrc.value, "scale") as Symptom.ModifierError
      : {...this.errorPublisherSrc.value, scale});
  }

  private get state() {
    return this.s.getState()
  }

  private setModifierCtrl(oldName: string, newName: string): void {
    if (oldName === newName) return;

    switch (newName.toLowerCase()) {
      case "ethnicity":
        this.toEthnicityCtrl(this.modifierCtrl);
        break;
      case "time":
        this.toScaleCtrl(this.modifierCtrl);
        break;
      case "recurs":
        this.toEthnicityCtrl(this.modifierCtrl);
        break;
      default:
        throw Error("Modifier name not valid.");
    }
  }

  private toEthnicityCtrl(modifierCtrl: FormGroup): void {
    const scaleCtrl = modifierCtrl.get("scale");
    let modifierValueCtrl = modifierCtrl.get("modifierValue");

    this.modifierValueSub && this.modifierValueSub.unsubscribe();

    if (!modifierValueCtrl) {
      modifierValueCtrl = new FormControl("", Validators.required);
      modifierCtrl.setControl("modifierValue", modifierValueCtrl);
    } else {
      modifierValueCtrl.setValue("");
    }

    if (scaleCtrl) {
      modifierCtrl.removeControl("scale");
      this.onScaleError({});
    }

    this.modifierValueSub = formCtrlErrorTracker("modifierValue", modifierValueCtrl, this.errorPublisherSrc)
  }

  private toScaleCtrl(modifierCtrl: FormGroup): void {
    const scaleCtrl = modifierCtrl.get("scale") as FormGroup;
    const defaults = this.defaultScaleValue();

    if (!defaults) {
      console.error("Unable to determine defaults for the scale");
      return;
    }

    if (scaleCtrl) {
      this.setExistingScaleCtrlValue(scaleCtrl, defaults);
      scaleCtrl.patchValue({ timeFrame: "" });
      scaleCtrl.markAsUntouched();
    } else {
      modifierCtrl.addControl("scale", formGroupFactory(defaults, this.state));
    }

    modifierCtrl.removeControl("modifierValue");
    this.modifierValueSub && this.modifierValueSub.unsubscribe();

  }

  private setExistingScaleCtrlValue(scaleCtrl: FormGroup, defaults: Symptom.ScaleValue): void {
    const upperTimeLimit = scaleCtrl.get("upperTimeLimit");
    const scaleTimeLimitStart = scaleCtrl.get("scaleTimeLimitStart");
    const timeUnit = scaleCtrl.get("timeUnit");
    const value = scaleCtrl.get("value");

    if (!upperTimeLimit || !scaleTimeLimitStart || !timeUnit || !value) {
      console.error("Not all scale controls are properly configured");
      return;
    }

    upperTimeLimit.setValue(defaults.upperTimeLimit);
    scaleTimeLimitStart.setValue(defaults.scaleTimeLimitStart);
    timeUnit.setValue(defaults.timeUnit);
    value.setValue("");
    value.setValidators(Validators.required);
  }

  private onPublishError(modifierError: Symptom.ModifierError) {
    this.error.emit(_.keys(modifierError).length > 2 ? modifierError : {});
  }

  private onModifierNameChange(name: string) {
    this.setModifierCtrl(this.modifierCtrl.value.name, name);
    this.cd.detectChanges();
  }

  private onModifierNameCtrlChange(name: string) {
    if (name !== "Ethnicity" && name !== "Recurs") {
      const temp = { ...this.errorPublisherSrc.value };

      if (temp["modifierValue"]) {
        delete temp["modifierValue"];
      }

      this.errorPublisherSrc.next({ ...temp, name });
    } else {
      this.errorPublisherSrc.next({ ...this.errorPublisherSrc.value, name })
    }
  }

  private checkLikelihood(likelihood: AbstractControl) {
    if (likelihood) {
      this.subs.push(formCtrlErrorTracker("likelihood", likelihood, this.errorPublisherSrc));
    } else {
      console.error("Likelihood is missing from modifier.");
    }
  }

  private checkModifier(modifier: AbstractControl) {
    if (modifier) {
      this.subs.push(formCtrlErrorTracker("modifierValue", modifier, this.errorPublisherSrc));
    }
  }

  private defaultScaleValue() {
    return defaultScaleValue(
      this.symptomData,
      this.symptomData.symptomsModel,
      this.s.getState()
    );
  };

}
