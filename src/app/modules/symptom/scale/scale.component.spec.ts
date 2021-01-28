import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import * as _ from "lodash";
import { ScaleComponent } from "./scale.component";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TitleCasePipe } from "../../pipes/title-case.pipe";
import { dataStoreRefTypes } from "../../../state/symptoms/symptoms.selectors";
import { defaultState, navInit, symptomsInit, workbenchInit } from "../../../app.config";
import ScaleError = Symptom.ScaleError;
import { TimeRange } from "../../../util/data/illness";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { OrderByPipe } from "../../pipes/order-by.pipe";
import { Component, EventEmitter, Input, Output, SimpleChange } from "@angular/core";

const testData = require("./../../../../../server/test-storage.json").symptoms.data;
const group = testData[Object.keys(testData)[0]];
const fakeIllnesses: Illness.Normalized.IllnessValue[] = require("../../../../test/data/illnesses.json");
const fakeSymptoms: Symptom.Data[] = require("../../../../test/data/symptoms.json");
const fakeCategories: Workbench.Normalized.Category[] = group.categories;

_.map(fakeSymptoms, (symptom: Symptom.Data) => symptomsInit.entities.symptoms[symptom.symptomID] = symptom);
_.map(fakeIllnesses, (illness: Illness.Normalized.IllnessValue) => workbenchInit.illnesses.values[illness.form.idIcd10Code] = illness);
_.map(fakeCategories, (category: Workbench.Normalized.Category) => symptomsInit.entities.categories[category.categoryID] = category);
(symptomsInit.entities as any).symptomGroups = testData;
navInit.activeGroup = fakeIllnesses[0].form.symptomGroups[0] as any;
(workbenchInit.illnesses as any).active = fakeIllnesses[0].form.idIcd10Code;
(defaultState as any).workbench = workbenchInit;
(defaultState as any).symptoms = symptomsInit;
(defaultState as any).nav = navInit;


@Component({
  selector: "mica-scale-button",
  template: "<div></div>"
})
class MockScaleButtonComponent {
  @Input() isAvailable: boolean;
  @Input() isSelected: boolean;
  @Input() isInvalid: boolean;
  @Input() isDisabled: boolean;
  @Input() tooltip: string;
  @Input() range: TimeRange;
  @Output() toggleRange: EventEmitter<void> = new EventEmitter();
}

describe("ScaleComponent", () => {
  let component: ScaleComponent;
  let fixture: ComponentFixture<ScaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ScaleComponent,
        MockScaleButtonComponent,
        TitleCasePipe,
        OrderByPipe
      ],
      providers: [
      ],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        NgbModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleComponent);
    component = fixture.componentInstance;
    component.symptomData = fakeSymptoms[0];
    component.symptomsModel = fakeSymptoms[0].symptomsModel;
    component.scaleDataStore = <Workbench.DataStoreRefTypesDictionary>_.pick(dataStoreRefTypes(defaultState), group.categories[0].symptoms[0].symptomsModel.dataStoreTypes);
    component.scaleFormGroup = new FormGroup({
      "upperTimeLimit": new FormControl(30),
      "scaleTimeLimitStart": new FormControl(0),
      "value": new FormControl(8),
      "slope": new FormControl("Flat"),
      "timeUnit": new FormControl("Hours"),
      "always": new FormControl(false),
      "timeFrame": new FormControl("")
    });
    component.selectedTimeRanges = {};
    component.validTimeRanges = {
      first: {
        name: "first",
        count: 1
      },
      second: {
        name: "second",
        count: 2
      }
    };
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("ngOnInit", () => {
    const addControlSpy = spyOn(component.scaleFormGroup, "addControl").and.callThrough();

    component.scaleFormGroup.removeControl("timeFrame");
    component.ngOnInit();
    expect(addControlSpy).toHaveBeenCalled();
  });

  it("ngOnInit: no symptomsModel", () => {
    component.symptomsModel = null;
    expect(() => component.ngOnInit()).toThrow();
  });

  it("onError", () => {
    const scaleError = {} as ScaleError;
    const errorEmitSpy = spyOn(component.error, "emit").and.callThrough();

    component["onError"](scaleError);
    expect(errorEmitSpy).toHaveBeenCalled();
  });

  it("scaleValidationClass", () => {
    const scaleForm = new FormGroup({});
    const correctClassName = "has-success";

    component.scaleFormGroup = scaleForm;
    expect(component.scaleValidationClass).toEqual(correctClassName);
  });

  it("scaleValidationClass", () => {
    const scaleForm = new FormGroup({});
    const correctClassName = "has-warning";

    component.scaleFormGroup = scaleForm;
    component.scaleFormGroup.setErrors({required: true});
    expect(component.scaleValidationClass).toEqual(correctClassName);
  });

  it("onAlwaysClick", () => {
    const alwaysFlagSpy = spyOnProperty(component, "isAlwaysSet", "get");

    alwaysFlagSpy.and.returnValue(true);
    component.onAlwaysClick();
    expect(component["currentSelectedRanges"]).toEqual({});

    alwaysFlagSpy.and.returnValue(false);
    component.onAlwaysClick();
    expect(Object.keys(component["currentSelectedRanges"]).length).toEqual(Object.keys(component.validTimeRanges).length);
  });

  it("toggleRange", () => {
    const rangeName = Object.keys(component.validTimeRanges)[0];
    const range = component.validTimeRanges[rangeName];
    const setValueSpy = spyOn(component.timeFrameControl, "setValue").and.callThrough();
    const setValiditySpy = spyOn(<any>component, "setTimeFrameValidity").and.callFake(() => {});

    component.toggleRange(range);
    expect(component["currentSelectedRanges"][rangeName]).toEqual(range);

    component.toggleRange(range);
    expect(component["currentSelectedRanges"][rangeName]).toBeFalsy();

    expect(setValueSpy).toHaveBeenCalledTimes(2);
    expect(setValiditySpy).toHaveBeenCalledTimes(2);
  });

  it("setTimeFrameValidity", () => {
    const setErrorsSpy = spyOn(component.timeFrameControl, "setErrors").and.callFake(() => {});

    component["setTimeFrameValidity"]();
    expect(setErrorsSpy).toHaveBeenCalled();
  });

  it("setCurrentSelectedRanges", () => {
    const rangeName = Object.keys(component.validTimeRanges)[0];
    const range = component.validTimeRanges[rangeName];
    const timeFrameControl = new FormControl(rangeName);

    spyOnProperty(component, "timeFrameControl", "get").and.returnValue(timeFrameControl);

    component["setCurrentSelectedRanges"]();
    expect(component["currentSelectedRanges"][rangeName]).toEqual(range);
  });

  it("setCurrentSelectedRanges", () => {
    const timeFrameControlSpy = spyOnProperty(component, "timeFrameControl", "get");
    const rangeName = Object.keys(component.validTimeRanges)[0];
    const range = component.validTimeRanges[rangeName];

    timeFrameControlSpy.and.returnValue(new FormControl(""));
    component["setCurrentSelectedRanges"]();
    expect(component["currentSelectedRanges"]).toEqual({});

    timeFrameControlSpy.and.returnValue(new FormControl(rangeName));
    component["setCurrentSelectedRanges"]();
    expect(component["currentSelectedRanges"][rangeName]).toEqual(range);
  });

  it("rangeAvailable", () => {
    const rangeName = Object.keys(component.validTimeRanges)[0];
    const likelihood = "likely";
    const range = component.validTimeRanges[rangeName];

    component.selectedTimeRanges = {};
    component["currentSelectedRanges"] = {};
    expect(component.rangeAvailable(range)).toEqual(true);

    component.selectedTimeRanges[likelihood] = { [rangeName]: range };
    component.likelihood = likelihood;
    expect(component.rangeAvailable(range)).toEqual(false);

    component["currentSelectedRanges"][rangeName] = range;
    expect(component.rangeAvailable(range)).toEqual(true);
  });

  it("isAlwaysCtrlVisible", () => {
    const selectedRangesSpy = spyOnProperty(<any>component, "selectedLikelihoodTimeRanges", "get");

    component.alwaysControlIsVisible = true;
    selectedRangesSpy.and.returnValue({});

    component["currentSelectedRanges"] = {};
    expect(component.isAlwaysCtrlVisible).toEqual(true);

    component["currentSelectedRanges"] = null;
    expect(component.isAlwaysCtrlVisible).toEqual(true);
  });

  it("selectedLikelihoodTimeRanges", () => {
    const likelihood = "likely";
    const range = { name: "one", count: 1 };

    expect(component["selectedLikelihoodTimeRanges"]).toEqual({});

    component.likelihood = likelihood;
    component.selectedTimeRanges = { [likelihood]: { [range.name]: range } };
    expect(component["selectedLikelihoodTimeRanges"][range.name]).toEqual(range);
  });

  it("ngOnChanges", () => {
    const rangeName = Object.keys(component.validTimeRanges)[0];
    const range = component.validTimeRanges[rangeName];
    const nextLikelihood = "likely";
    const prevSelectedTimeRanges = { [nextLikelihood]: { [rangeName]: range } };

    const changes = {
      likelihood: new SimpleChange("", nextLikelihood, false),
      selectedTimeRanges: new SimpleChange(prevSelectedTimeRanges, {}, false),
    };

    const timeFrameCtrl = new FormControl(rangeName);
    const timeFrameCtrlSpy = spyOnProperty(component, "timeFrameControl", "get");

    timeFrameCtrlSpy.and.returnValue(timeFrameCtrl);
    component.ngOnChanges(changes);
    expect(timeFrameCtrl.value).toEqual("");
    expect(component["currentSelectedRanges"]).toEqual({});

    changes.selectedTimeRanges.previousValue = null;
    component["currentSelectedRanges"] = { [rangeName]: range };
    component.ngOnChanges(changes);
    expect(timeFrameCtrl.value).toEqual(rangeName);
    expect(component["currentSelectedRanges"][rangeName]).toEqual(range);

    delete changes.likelihood;
    component.ngOnChanges(changes);
    expect(timeFrameCtrl.value).toEqual(rangeName);
    expect(component["currentSelectedRanges"][rangeName]).toEqual(range);
  });

});
