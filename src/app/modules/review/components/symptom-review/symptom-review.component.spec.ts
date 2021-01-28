import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { Component, Input } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormControl, FormArray, FormGroup } from "@angular/forms"

import * as _ from "lodash";

import { SymptomReviewComponent } from "./symptom-review.component";
import { TitleCasePipe } from "../../../pipes/title-case.pipe";
import { BadgeIconComponent } from "../../../gui-widgets/components/badge-icon/badge-icon.component";
import { NgRedux } from "@angular-redux/store";
import { defaultState } from "../../../../app.config";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import * as workbenchActions from "./../../../../state/workbench/workbench.actions";
import * as symptomsSelectors from "../../../../state/symptoms/symptoms.selectors";
import * as workbenchSelectors from "../../../../state/workbench/workbench.selectors";
import { of } from "rxjs/observable/of";

const fakeSymptoms = require("../../../../../test/data/symptoms.json");
const state = _.cloneDeep(defaultState);

const mockRedux = {
  getState: (): State.Root => {
    return state
  },
  select: (selector) => of(selector(state)),
  dispatch: (arg: any) => {}
};


@Component({
  selector: "source-tooltip",
  template: "<div></div>",
})
export class MockSourceTooltipComponent{
  @Input() info: Symptom.RowValue;
  constructor() { }
}


@Component({
  selector: "mica-dropdown",
  template: "<div></div>",
})
export class MockMicaDropdownComponent {
  @Input() formControl: FormControl;
  @Input() title: string;
  @Input() items: MICA.SelectableEl[];
  @Input() size: string;
  @Input() controlDisabled: boolean;
  constructor() { }
}

const mockRouter = {
  navigate: jasmine.createSpy("navigate")
};

describe("SymptomReviewComponent", () => {
  let component: SymptomReviewComponent;
  let fixture: ComponentFixture<SymptomReviewComponent>;
  let redux: NgRedux<State.Root>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SymptomReviewComponent,
        TitleCasePipe,
        BadgeIconComponent,
        MockMicaDropdownComponent,
        MockSourceTooltipComponent
      ],
      imports: [BrowserAnimationsModule],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        { provide: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    redux = TestBed.get(NgRedux);
    fixture = TestBed.createComponent(SymptomReviewComponent);
    component = fixture.componentInstance;
    spyOn(symptomsSelectors, "symptomsInCatData").and.returnValue((state) => fakeSymptoms);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should trackByFn", () => {
    expect(component.trackByFn(1, {bias: true} as Symptom.RowValue)).toEqual(1);
  });

  it("should onSymptomDel", () => {
    component.onSymptomDel(1, "someID");
    expect((component as any).symptomStates[1]).toEqual("out");
  });

  it("should symptomDelDispatch", () => {
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    spyOn(workbenchActions, "completeSymptomGroup").and.callFake(param => param);
    spyOn(workbenchActions, "deleteSymptom").and.callFake(param => param);
    spyOn(symptomsSelectors, "symptomDataPath").and.returnValue(state => state);
    (component as any).symptomStates[1] = "out";
    component.symptomGroupID = "symptomGroupID"
    component.symptomDelDispatch(1, "someID");
    expect(mockDispatch).toHaveBeenCalledWith("someID");
    expect(mockDispatch).toHaveBeenCalledWith("symptomGroupID");
    component.categoryID = "SYMPTCG33";
    component.symptomDelDispatch(1, "someID");
  });

  it("should symptomDelDispatch", () => {
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    spyOn(workbenchActions, "deleteSymptom").and.callFake(param => param);
    spyOn(symptomsSelectors, "symptomDataPath").and.returnValue(state => state);
    (component as any).symptomStates[1] = "in";
    component.symptomDelDispatch(1, "someID");
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("should onEditSymptomWorkbench", () => {
    const event = new Event("");
    const mockPreventDefault = spyOn(event, "preventDefault").and.callThrough();
    spyOn(symptomsSelectors, "symptomDataPath").and.returnValue(state => state);

    mockRouter.navigate.and.returnValue(Promise.reject("someID"));
    component.onEditSymptomWorkbench("someID", event);
    expect(mockPreventDefault).toHaveBeenCalled();
  });


  it("should rowValues", () => {
    expect(component.rowValues({bias: true} as Symptom.RowValue)).toEqual(["", "true", ...Array(7).fill("")]);
    expect(component.rowValues({bias: false} as Symptom.RowValue)).toEqual(["", "false", ...Array(7).fill("")]);
    expect(component.rowValues({likelihood: "val"} as Symptom.RowValue)).toEqual([]);
  });

  it("should modifierDisplayValues", () => {
    expect(component.modifierDisplayValues({name: "Ethnicity", likelihood: "val"} as Symptom.ModifierValue))
      .toEqual(["", "", "val", "Ethnicity", ...Array(5).fill("")]);
    expect(component.modifierDisplayValues({name: "Age", likelihood: "val"} as Symptom.ModifierValue))
      .toEqual(["", "", "val", "Age", ""]);
    expect(component.modifierDisplayValues({likelihood: "val"} as Symptom.ModifierValue)).toEqual([]);
  });

  it("should calculateRows", () => {
    let row: Symptom.RowValue = { bias: true } as Symptom.RowValue;

    const modifierValues = [ { name: "Ethnicity", likelihood: "val" } ] as Symptom.ModifierValue[];
    const mockSourceInfo = { sourceInfo: [ { sourceID: 23 } ] };

    row = <Symptom.RowValue>{
      ...row,
      modifierValues,
      ...mockSourceInfo
    };

    expect(component.calculateRows([row])).toEqual([
      {
        bias: true,
        sourceInfo: [ { sourceID: 23 } ],
        modifierValues
      },
      { name: "Ethnicity", likelihood: "val" },
    ]);
  });

  it("should getSymptomData", () => {
    const fakeSymptom = fakeSymptoms[0];
    spyOnProperty(component, "symptomsData", "get").and.returnValue(Observable.of(fakeSymptoms));

    component.getSymptomData(fakeSymptom.symptomID).subscribe(symptom => expect(symptom).toEqual(fakeSymptom));
  });

  it("should getSymptomProp", () => {
    const fakeSymptom = fakeSymptoms[0];
    spyOn(component, "getSymptomData").and.returnValue(Observable.of(fakeSymptom));

    component.getSymptomProp(fakeSymptom.symptomID, "name").subscribe(name => expect(name).toEqual(fakeSymptom.name));
  });

  it("should symptomsData", () => {
    const newFakeSymptom: Symptom.Data = _.cloneDeep(fakeSymptoms[0]);
    newFakeSymptom.name = "Some Name";
    newFakeSymptom.symptomID = "someID";
    spyOnProperty(component, "symptomsValue", "get").and.returnValue(Observable.from([fakeSymptoms, fakeSymptoms]));
    component.symptomsData.subscribe(symptoms => expect(symptoms).toEqual(fakeSymptoms));
  });

  it("should return symptom color class", () => {
    component.ecwValidationSymptoms = {"18": {} as Symptom.Value};
    expect(component.symptomColorClass("17")).toEqual("symptom-orange");
  });

  it("should not return symptom color class", () => {
    component.ecwValidationSymptoms = null;
    expect(component.symptomColorClass("17")).toEqual("");
  });

  it("onEditSymptomWorkbench", () => {
    const ev = {
      preventDefault: () => {}
    } as Event;
    const loc = {
      categoryName: "chest",
      viewName: "view"
    };
    component.symptomGroupID = "pain";
    spyOn(symptomsSelectors, "symptomDataPath").and.returnValue(() => loc);
    component.onEditSymptomWorkbench("17", ev);
    expect(mockRouter.navigate).toHaveBeenCalled();
  });

  it("addRowsForMultipliersAndModifiers", () => {
    const symptoms = [
      {
        rows: [
          {
            multiplier: ["multiplier"]
          },
          {
            modifierValues: [{
              modifierValue: "modifier,value"
            }]
          },
          {
            modifierValues: null
          },
          {
            modifierValues: [17]
          }
        ]
      },
      { rows: null }
    ];
    expect(component["addRowsForMultipliersAndModifiers"](symptoms as any)[0].rows.length).toEqual(4);
    expect(component["addRowsForMultipliersAndModifiers"](symptoms as any)[1].rows).toBe(null);
  });

  it("calcRows", () => {
    const s: Symptom.Value[] = [
      { rows: [] as Symptom.RowValue[] } as Symptom.Value,
      { } as Symptom.Value
    ];
    const calculateRowsSpy = spyOn(component, "calculateRows").and.callThrough();
    const symptpoms = component["calcRows"](s);
    expect(symptpoms).toEqual(s);
    expect(calculateRowsSpy).toHaveBeenCalledTimes(1);
  });

  it("calculateRows", () => {
    const rows = [
      {
        likelihood: "likelihood",
        sourceType: "sourceType"
      }
    ];
    expect(component.calculateRows(rows as any)).toBeDefined();
  });

  it("calculateRows", () => {
    const rows = [
      {
        sourceType: "sourceType"
      }
    ];
    expect(component.calculateRows(rows as any)).toBeDefined();
  });

  it("isInteger", () => {
    expect(component.isInteger(1)).toBeTruthy();
    expect(component.isInteger("string")).toBeFalsy();
    expect(component.isInteger(undefined)).toBeFalsy();
  })

  it("getLikelihoodCtrl", () => {
    const form1 = new FormControl(1);
    const form2 = new FormControl(2);
    component.controls = {illnessID: new FormArray([new FormGroup({
      root: form1,
      values: new FormArray([form2])
    })])}
    let control = component.getLikelihoodCtrl("illnessID", 0);
    expect(control).toBe(form1);
    control = component.getLikelihoodCtrl("illnessID", 0, 0);
    expect(control).toBe(form2);
  })

  it("generateControls", () => {
    const symptom = {
      symptomID: "icd10Code",
      rows: [
        {likelihood: "20"} as Symptom.RowValue,
        {modifierValues: [{likelihood: "40"} as Symptom.ModifierValue]} as Symptom.RowValue,
      ]
    } as Symptom.Value
    spyOn(workbenchSelectors, "symptomValue").and.returnValue(() => symptom);
    component["generateControls"]([
      symptom,
      {symptomID: "icd10Code2"} as Symptom.Value
    ]);
    expect(component.controls["icd10Code"]).toBeDefined();
    expect(component.controls["icd10Code2"]).toBeUndefined();
    expect(component.controls["icd10Code"].at(0).value).toEqual({root: "20"});
    expect(component.controls["icd10Code"].at(1).value).toEqual({values: ["40"]});
  });

  it("OnInit isReviewer", () => {
    const symptom: Symptom.Value[] = [
      { rows: [] as Symptom.RowValue[] } as Symptom.Value,
      { } as Symptom.Value
    ];
    spyOn(component, "isReviewer").and.returnValue(true);
    const generateControlsSpy = spyOn(component, "generateControls").and.callThrough();
    component.ngOnInit();
    expect(generateControlsSpy).toHaveBeenCalled();
  });

  it("valuesAreEqual", () => {
    const obj = {a: 1};
    expect(component["valuesAreEqual"](obj, obj)).toBeTruthy();
  });

  it("onControlValueChange", () => {
    spyOn(workbenchSelectors, "symptomValue").and.returnValue(() => null);
    expect(component["onControlValueChange"]({symptomID: "id"} as any, null)).toBeUndefined();
  });

  it("onControlValueChange", () => {
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();
    const rowA = {
      root: "root",
      likelihood: "likelihood",
      modifierValues: ["modifierValue"],
      values: ["value"]
    };
    const rowB = {
      likelihood: "likelihood",
      values: ["value"]
    };
    const symptom = {
      rows: [rowA, rowB]
    };
    spyOn(workbenchSelectors, "symptomValue").and.returnValue(() => symptom);
    expect(component["onControlValueChange"]({symptomID: "id"} as any, [rowA, rowB])).toBeUndefined();
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it("generateControls", () => {
    const symptoms = [{
      symptomID: "id",
      rows: [{
        likelihood: "likelihood",
        modifierValues: [{likelihood: "likelihood"}]
      }, {
        likelihood: null,
        modifierValues: null
      }]
    }];
    spyOn(workbenchSelectors, "symptomValue").and.returnValue(() => symptoms[0]);
    expect(component["generateControls"](symptoms as any)).toBeUndefined();
    expect(component.controls["id"]).toBeDefined();
  });

  it("addRowsForMultipliersAndModifiers", () => {
    expect(component["addRowsForMultipliersAndModifiers"]([{rows: []} as Symptom.Value]));
  });

  it("isNumber_True_ForNumber", () => {
    expect(component.isNumber(1)).toBeTruthy();
  });

  it("isNumber_False_ForNullUndefinedOrEmptyString", () => {
    expect(component.isNumber(null)).toBeFalsy();
  });


  it("getGroupedSymptoms", () => {
    const sympt =         { bodyParts: ["Ear"], isMissing: false } as Symptom.Value
    const symptTwo =      { bodyParts: ["Left Ear", "Right Ear"], isMissing: false } as Symptom.Value;
    const symptRequired = { bodyParts: undefined, isMissing: true } as Symptom.Value;
    const symptGeneral =  { bodyParts: undefined, isMissing: false } as Symptom.Value
    // Physic Symptom
    const groupedPhysic = [
      {name: "Left Ear & Right Ear", symptoms: [ symptTwo ]},
      {name: "Ear", symptoms: [ sympt, sympt ]},
      {name: "Machine Learning Required Symptom", symptoms: [ symptRequired ]},
    ];
    expect(component.getGroupedSymptoms([symptRequired, sympt, symptTwo, sympt])).toEqual(groupedPhysic);
    // General Symptom
    const groupedGeneral = [
      {name: "root", symptoms: [ symptGeneral ]},
      {name: "Machine Learning Required Symptom", symptoms: [ symptRequired ]},
    ];
    expect(component.getGroupedSymptoms([symptRequired, symptGeneral])).toEqual(groupedGeneral);
  })

});
