import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import * as _ from "lodash";

import { ModifierComponent } from "./modifier.component";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { NgRedux } from "@angular-redux/store";
import ModifierError = Symptom.ModifierError;
import { defaultState } from "../../../app.config";
import * as errors from "../../../util/forms/errors";
import { of } from "rxjs/observable/of";
import * as symptomFactory from "../../symptom/symptom.factory";
import * as createFormUtils from "../../../util/forms/create";
import { TimeRange } from "../../../util/data/illness";
import * as illnessDataUtil from "../../../util/data/illness";

const fakeSymptoms = require("../../../../test/data/symptoms.json");
const state = _.cloneDeep(defaultState);

const mockRedux = {
  getState: () => {
    return state
  },
  select: (selector) => of(selector(state)),
  dispatch: (arg: any) => {
  }
};

@Component({
  selector: "mica-modifier-row",
  template: "<div></div>"
})
class MockModifierRowComponent {
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
  @Input() selectedTimeRanges: { [timeFrame: string]: TimeRange };
  @Input() validTimeRanges: { [timeFrame: string]: TimeRange };

  @Output() readonly addRow: EventEmitter<boolean> = new EventEmitter();
  @Output() readonly removeRow: EventEmitter<boolean> = new EventEmitter();
  @Output() modifierNameChanges: EventEmitter<string> = new EventEmitter();
  @Output() error: EventEmitter<Symptom.ModifierError | {}> = new EventEmitter();
}

describe("ModifierComponent", () => {
  const fb: FormBuilder = new FormBuilder();
  const scale = {
    scale: {
      value: "2",
      upperTimeLimit: 1
    },
    name: "Time"
  };
  let component: ModifierComponent;
  let fixture: ComponentFixture<ModifierComponent>;
  let modifierValue: Symptom.ModifierValue;
  let defaultModifierValueSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ModifierComponent,
        MockModifierRowComponent
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    modifierValue = {
      name: "Time",
      modifierValue: "modifierVal",
      scale: {
        upperTimeLimit: 1000,
        value: 3,
        scaleTimeLimitStart: 500,
        slope: "slope",
        timeUnit: "sec",
        timeFrame: ""
      },
      likelihood: "likelihood"
    };
    fixture = TestBed.createComponent(ModifierComponent);
    component = fixture.componentInstance;
    component.modifierCtrlArray = new FormArray([new FormControl(modifierValue)]);
    (component as any).symptomData = fakeSymptoms[0];
    fixture.detectChanges();
    defaultModifierValueSpy = spyOn(symptomFactory, "defaultModifierValue");
    defaultModifierValueSpy.and.returnValue(scale);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("onAddRow", () => {
    const idx = 0;
    const atSpy = spyOn(component["modifierCtrlArray"], "at");
    const pushSpy = spyOn(component["modifierCtrlArray"], "push");

    component.readOnly = false;

    atSpy.and.returnValue(fb.group({ name: "Time" }));
    component.onAddRow(idx);
    expect(defaultModifierValueSpy.calls.mostRecent().args[1]).toEqual("Time");

    atSpy.and.returnValue(fb.group({ name: "Ethnicity" }));
    component.onAddRow(idx);
    expect(pushSpy.calls.mostRecent().args[0].value.modifierValue).toEqual("");

    atSpy.and.returnValue(fb.group({ name: "Ethnicity", scale: { value: "some value" } }));
    component.onAddRow(idx);
    expect(pushSpy.calls.mostRecent().args[0].value.scale).toBeFalsy();
    expect(pushSpy.calls.mostRecent().args[0].value.modifierValue).toEqual("");
  });

  it("onAddRow readOnly", () => {
    const spyAt = spyOn(component.modifierCtrlArray, "at");

    component.readOnly = true;
    component.onAddRow(1);
    expect(spyAt).not.toHaveBeenCalled();
  });

  it("onModifierError", () => {
    const idx = 0;
    const error: ModifierError = {index: idx, name: "error"};
    const mockCompactErrorCollection = spyOn(errors, "compactErrorCollection").and.callFake(
      () => {},
    );

    component.onModifierError(error, idx);
    expect(mockCompactErrorCollection).toHaveBeenCalled();
  });

  it("onRemoveRow", () => {
    const idx = 0;
    const error: ModifierError = {index: idx, name: "error"};

    component.onRemoveRow(idx);
    component["errorsPublisherSrc"].next([error]);
    expect(component.modifierCtrlArray.at(idx)).toBeFalsy();
  });

  it("onRemoveRow", () => {
    const errorsArr = [
      { index: 0, name: "name" },
      { index: 1, name: "name" },
      { index: 2, name: "name" },
    ];

    component["errorsPublisherSrc"].next(errorsArr);
    component.readOnly = false;
    component.onRemoveRow(1);
    expect(component["errorsPublisherSrc"].value.length).toEqual(errorsArr.length - 1);
    expect(component["errorsPublisherSrc"].value[1].index).toEqual(1);
  });

  it("onRemoveRow readOnly", () => {
    const err = { index: 0, name: "name" };

    component["errorsPublisherSrc"].next([err]);
    component.readOnly = true;
    component.onRemoveRow(0);
    expect(component["errorsPublisherSrc"].value.length).toEqual(1);
  });

  it("onAddRow", () => {
    component.modifierCtrlArray = new FormArray([new FormControl(scale)]);
    expect(component.onAddRow(0)).toBeUndefined();
  });

  it("onAddRow", () => {
    const ctrlArray = new FormArray([
      new FormControl({ scale: null, name: "Ethnicity" })
    ]);
    spyOn(createFormUtils, "formGroupFactory").and.returnValue(new FormGroup({}));
    component.modifierCtrlArray = ctrlArray;
    expect(component["onAddRow"](0)).toBeUndefined();
  });

  it("setSelectedRanges", () => {
    const ranges = [
      {
        count: 1,
        name: "range"
      },
      {
        count: 2,
        name: "range2"
      }
    ];
    const getSelectedRangesSpy = spyOn(illnessDataUtil, "getSelectedRanges").and.callFake(() => ranges);
    component["setSelectedRanges"]();
    expect(getSelectedRangesSpy).toHaveBeenCalled();
  });

  it("setSelectedRanges", () => {
    const getSelectedRangesSpy = spyOn(illnessDataUtil, "getSelectedRanges").and.callFake(() => {
    });
    component["setSelectedRanges"]();
    expect(getSelectedRangesSpy).toHaveBeenCalled();
  });

});
