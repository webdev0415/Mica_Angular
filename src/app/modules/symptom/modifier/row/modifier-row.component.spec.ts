import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import * as _ from "lodash";

import { ModifierRowComponent } from "./modifier-row.component";
import { DropdownComponent } from "../../../gui-widgets/components/dropdown/dropdown.component";
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { LikelihoodComponent } from "../../likelihood/likelihood.component";
import { TitleCasePipe } from "../../../pipes/title-case.pipe";
import { NgRedux } from "@angular-redux/store";
import { defaultState } from "app/app.config";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import * as symptomFactory from "../../symptom.factory";
import { of } from "rxjs/observable/of";

const testData = require("./../../../../../../server/test-storage.json").symptoms.data;
const group = testData[Object.keys(testData)[0]];
const fakeIllnesses: Illness.Normalized.IllnessValue[] = require("../../../../../test/data/illnesses.json");
const fakeSymptoms: Symptom.Data[] = require("../../../../../test/data/symptoms.json");
const fakeCategories: Workbench.Normalized.Category[] = group.categories;
import ControlError = MICA.ControlError;
import ModifierError = Symptom.ModifierError;
import { TimeRange } from "app/util/data/illness";
import { Subscription } from "rxjs";
import * as errors from "app/util/forms/errors";

const fb = new FormBuilder();
const state = _.cloneDeep(defaultState);
const mockRedux = {
  getState: () => {
    return state
  },
  select: (selector) => of(selector(state)),
  dispatch: (arg: any) => {
  }
};

(state.symptoms.entities as any).symptomGroups = testData;
state.nav.activeGroup = fakeIllnesses[0].form.symptomGroups[0] as any;
(state.workbench.illnesses as any).active = fakeIllnesses[0].form.idIcd10Code;
_.map(fakeSymptoms, (symptom: Symptom.Data) => state.symptoms.entities.symptoms[symptom.symptomID] = symptom);
_.map(fakeIllnesses, (illness: Illness.Normalized.IllnessValue) => state.workbench.illnesses.values[illness.form.idIcd10Code] = illness);
_.map(fakeCategories, (category: Workbench.Normalized.Category) => state.symptoms.entities.categories[category.categoryID] = category);

@Component({
  selector: "mica-scale",
  template: "<div></div>"
})
class MockScaleComponent {
  @Input() readOnly = false;
  @Input() symptomsModel: Symptom.Model;
  @Input() symptomData: Symptom.Data;
  @Input() scaleDataStore: Workbench.DataStoreRefTypesDictionary;
  @Input() scaleFormGroup: FormGroup;
  @Input() alwaysControlIsVisible: boolean;
  @Input() validTimeRanges: { [timeFrame: string]: TimeRange };
  @Input() selectedTimeRanges: { [timeFrame: string]: TimeRange };
  @Input() modifierIndex: number;
  @Input() likelihood: string;
  @Output() error: EventEmitter<Symptom.ScaleError> = new EventEmitter();
}

describe("ModifierRowComponent", () => {
  let component: ModifierRowComponent;
  let fixture: ComponentFixture<ModifierRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ModifierRowComponent,
        DropdownComponent,
        LikelihoodComponent,
        MockScaleComponent,
        TitleCasePipe
      ],
      providers: [
        {provide: NgRedux, useValue: mockRedux}
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    const illness = fakeIllnesses[0];
    const symptoms = illness.entities.symptoms;
    const symptom = symptoms[_.keys(symptoms)[0]];
    const controls: { [key: string]: AbstractControl } = {};
    fixture = TestBed.createComponent(ModifierRowComponent);
    component = fixture.componentInstance;
    (component as any).symptomData = fakeSymptoms[0];
    _.map(symptom.rows[0].modifierValues[0] as any, (val, key) => {
      controls[key] = new FormControl(val)
    });
    (component as any).modifierCtrl = new FormGroup(controls);
    component.selectedTimeRanges = {};
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("setExistingScaleCtrlValue", () => {
    const formGroup = new FormGroup({});
    const defaultSymptomValue = {
      upperTimeLimit: 1,
      value: "",
      scaleTimeLimitStart: 1,
      slope: "slope",
      timeUnit: "s",
      timeFrame: ""
    };
    const symptomValue = {...defaultSymptomValue, upperTimeLimit: 2, scaleTimeLimitStart: 2, value: "different value"};

    component["setExistingScaleCtrlValue"](formGroup, defaultSymptomValue);
    expect(formGroup.get("value")).toBeFalsy();

    _.map(symptomValue, (val, key) => {
      formGroup.setControl(key, new FormControl(val));
    });
    component["setExistingScaleCtrlValue"](formGroup, defaultSymptomValue);
    expect(formGroup.value).toEqual(defaultSymptomValue);
  });

  it("toEthnicityCtrl: has modifierValue ctrl", () => {
    const formGroup = fb.group({ modifierValue: "some value"});

    component["toEthnicityCtrl"](formGroup);
    expect(formGroup.value.modifierValue).toEqual("");
  });

  it("toEthnicityCtrl: no modifierValue ctrl", () => {
    const formGroup = fb.group({});

    component["toEthnicityCtrl"](formGroup);
    expect(formGroup.get("modifierValue")).toBeTruthy();
  });

  it("toEthnicityCtrl: has scale ctrl", () => {
    const formGroup = fb.group({ scale: {} });

    component["toEthnicityCtrl"](formGroup);
    expect(formGroup.get("scale")).toBeFalsy();
  });

  it("toEthnicityCtrl: unsubscribe modifierValueSub", () => {
    const formGroup = fb.group({ scale: {} });
    const errorSub = new Subscription();

    spyOn(errors, "formCtrlErrorTracker").and.callFake(() => errorSub);

    component["modifierValueSub"] = new Subscription();
    component["toEthnicityCtrl"](formGroup);
    expect(formGroup.get("scale")).toBeFalsy();
    expect(component["modifierValueSub"]).toEqual(errorSub);
  });

  it("setModifierCtrl", () => {
    const mockToEthnicityCtrl = spyOn(component as any, "toEthnicityCtrl").and.callFake(() => {
    });
    const mockToScaleCtrl = spyOn(component as any, "toScaleCtrl").and.callFake(() => {
    });
    let oldName = "old";
    let newName = "new";

    expect(() => component["setModifierCtrl"](oldName, newName)).toThrow(jasmine.any(Error));

    newName = "ethnicity";
    component["setModifierCtrl"](oldName, newName);
    expect(mockToEthnicityCtrl).toHaveBeenCalledWith(component.modifierCtrl);

    newName = "recurs";
    component["setModifierCtrl"](oldName, newName);
    expect(mockToEthnicityCtrl).toHaveBeenCalledWith(component.modifierCtrl);

    newName = "time";
    component["setModifierCtrl"](oldName, newName);
    expect(mockToScaleCtrl).toHaveBeenCalledWith(component.modifierCtrl);

    oldName = newName;
    component["setModifierCtrl"](oldName, newName);
    expect(mockToEthnicityCtrl).toHaveBeenCalledTimes(2);
    expect(mockToScaleCtrl).toHaveBeenCalledTimes(1);
  });

  it("onScaleError", () => {
    const value = _.clone(component["errorPublisherSrc"].value);
    component.onScaleError({});
    expect(component["errorPublisherSrc"].value).toEqual(value);
  });

  it("toScaleCtrl", () => {
    const scale: Symptom.ScaleValue = {
      upperTimeLimit: 10,
      scaleTimeLimitStart: 0,
      slope: "slope",
      timeUnit: "",
      value: "",
      timeFrame: ""
    };
    const formGroup = fb.group({ modifierValue: "" });
    const mockSetExistingScaleCtrlValue = spyOn(component as any, "setExistingScaleCtrlValue").and.callFake(
      () => {},
    );
    const mockDefaultScaleValue = spyOn(symptomFactory, "defaultScaleValue");

    component["modifierValueSub"] = new Subscription();
    mockDefaultScaleValue.and.returnValue(scale);
    component["toScaleCtrl"](formGroup);
    expect(formGroup.get("scale")).toBeTruthy();
    expect(formGroup.get("modifierValue")).toBeFalsy();
    expect(mockSetExistingScaleCtrlValue).not.toHaveBeenCalled();
    expect(component["modifierValueSub"].closed).toEqual(true);
  });

  it("toScaleCtrl no default scale", () => {
    const formGroup = fb.group({});
    const mockDefaultScaleValue = spyOn(symptomFactory, "defaultScaleValue");

    mockDefaultScaleValue.and.returnValue(null);
    component["toScaleCtrl"](formGroup);
    expect(formGroup.get("scale")).toBeFalsy();
  });

  it("toScaleCtrl scale exists", () => {
    const scale: Symptom.ScaleValue = {
      upperTimeLimit: 10,
      scaleTimeLimitStart: 0,
      slope: "slope",
      timeUnit: "",
      value: "",
      timeFrame: ""
    };
    const formGroup = fb.group({ scale: {} });
    const mockDefaultScaleValue = spyOn(symptomFactory, "defaultScaleValue");
    const mockSetExistingScaleCtrlValue = spyOn(component as any, "setExistingScaleCtrlValue").and.callFake(
      () => {},
    );

    mockDefaultScaleValue.and.returnValue(scale);
    component["toScaleCtrl"](formGroup);
    expect(mockSetExistingScaleCtrlValue).toHaveBeenCalled();
  });

  it("hasEthnicity", () => {
    spyOnProperty(component, "modifierName", "get").and.returnValue("Ethnicity");
    expect(component.hasEthnicity).toBeFalsy();
  });

  it("hasRecurs", () => {
    spyOnProperty(component, "modifierName", "get").and.returnValue("Recurs");
    expect(component.hasRecurs).toBeFalsy();
  });

  it("ethnicityDataStore", () => {
    (component as any)["dataStoreRefTypes"] = {Ethnicity: {values: []}};
    expect(component.ethnicityDataStore).toEqual([]);
  });

  it("recursDataStore", () => {
    (component as any)["dataStoreRefTypes"] = {Recurs: {values: []}};
    expect(component.recursDataStore).toEqual([]);
  });

  it("onPublishError", () => {
    const err = {
      index: 1,
      name: "error",
      modifierValue: {} as ControlError
    };
    const emitSpy = spyOn(component.error, "emit").and.callThrough();
    component["onPublishError"](err);
    expect(emitSpy).toHaveBeenCalledWith(err);
  });

  it("onPublishError", () => {
    const err = {
      index: 1,
      name: "error",
    };
    const emitSpy = spyOn(component.error, "emit").and.callThrough();
    component["onPublishError"](err);
    expect(emitSpy).toHaveBeenCalledWith({});
  });

  it("onModifierNameChange", () => {
    const setModifierCtrlSpy = spyOn<any>(component, "setModifierCtrl").and.callFake(() => {
    });
    component["errorPublisherSrc"].next({name: "name"} as ModifierError);
    component["onModifierNameChange"]("name");
    expect(setModifierCtrlSpy).toHaveBeenCalled();
  });

  it("onModifierNameCtrlChange", () => {
    component["errorPublisherSrc"].next({
      modifierValue: {} as ControlError
    } as ModifierError);
    const nextSpy = spyOn(component["errorPublisherSrc"], "next");

    component["onModifierNameCtrlChange"]("Time");
    expect(nextSpy).toHaveBeenCalled();
  });

  it("onModifierNameCtrlChange", () => {
    const nextSpy = spyOn(component["errorPublisherSrc"], "next");

    component["errorPublisherSrc"].next({index: 1, name: "name"});
    component["onModifierNameCtrlChange"]("Time");
    expect(nextSpy).toHaveBeenCalled();
  });

  it("onModifierNameCtrlChange", () => {
    const nextSpy = spyOn(component["errorPublisherSrc"], "next");

    component["onModifierNameCtrlChange"]("Ethnicity");
    expect(nextSpy).toHaveBeenCalled();
  });

  it("checkLikelihood", () => {
    const consoleSpy = spyOn(console, "error").and.callThrough();
    component["checkLikelihood"](null);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("checkModifier", () => {
    const pushSpy = spyOn(component["subs"], "push").and.callThrough();
    component["checkModifier"](new FormControl(""));
    expect(pushSpy).toHaveBeenCalled();
  });

  it("defaultScaleValue", () => {
    const defaultScaleValueSpy = spyOn(symptomFactory, "defaultScaleValue").and.callFake(() => null);
    component["defaultScaleValue"]();
    expect(defaultScaleValueSpy).toHaveBeenCalled();
  });

  it("onScaleError", () => {
    const nextSpy = spyOn(component["errorPublisherSrc"], "next").and.callThrough();
    expect(component.onScaleError({scale: "scale"} as any)).toBeUndefined();
    expect(nextSpy).toHaveBeenCalled();
  });

  it ("scaleDataStore", () => {
    const refType = { title: "any" };
    const key = "Slope";

    (<any>component)["dataStoreRefTypes"] = { [key]: refType };
    expect(component.scaleDataStore[key]).toEqual(refType);
  });

  it ("getter likelihoodCtrl", () => {
    const likelihood = 20;

    this.modifierCtrl = fb.group({ likelihood });
    expect(component["likelihoodCtrl"].value).toEqual(likelihood);
  });
});
