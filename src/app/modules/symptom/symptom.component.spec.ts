import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import * as _ from "lodash";
import { Component, EventEmitter, Input, Output } from "@angular/core";

import { SymptomComponent } from "./symptom.component";
import { RouterTestingModule } from "@angular/router/testing";
import { testRoutes } from "../../../test/data/test-routes";
import { TestComponent } from "../../../test/test.component";
import { NgRedux } from "@angular-redux/store";
import { TreatmentsApiService } from "../treatments/services/treatments-api.service";
import { TreatmentApiServiceStub } from "../../../test/services-stubs/treatment-api-service-stub.service";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { navInit, symptomsInit, workbenchInit } from "app/app.config";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import * as workbenchSelectors from "app/state/workbench/workbench.selectors";
import * as workbenchActions from "app/state/workbench/workbench.actions";
import * as symptomSelectors from "app/state/symptoms/symptoms.selectors";
import * as ecwSelectors from "app/state/ecw/ecw.selectors";
import * as symptomFactory from "./symptom.factory";
import * as stateStore from "app/state/state.store";
import { of } from "rxjs/observable/of";
import Value = Symptom.Value;
import * as createFormUtils from "app/util/forms/create";

const testData = require("./../../../../server/test-storage.json").symptoms.data;
const group = testData[Object.keys(testData)[0]];
const fakeIllnesses: Illness.Normalized.IllnessValue[] = require("../../../test/data/illnesses.json");
const fakeSymptoms: Symptom.Data[] = require("../../../test/data/symptoms.json");
const fakeCategories: Workbench.Normalized.Category[] = group.categories;

_.map(fakeSymptoms, (symptom: Symptom.Data) => symptomsInit.entities.symptoms[symptom.symptomID] = symptom);
_.map(fakeIllnesses, (illness: Illness.Normalized.IllnessValue) => workbenchInit.illnesses.values[illness.form.idIcd10Code] = illness);
_.map(fakeCategories, (category: Workbench.Normalized.Category) => symptomsInit.entities.categories[category.categoryID] = category);
(symptomsInit.entities as any).symptomGroups = testData;
navInit.activeGroup = fakeIllnesses[0].form.symptomGroups[0] as any;
(workbenchInit.illnesses as any).active = fakeIllnesses[0].form.idIcd10Code;

const state = {
  workbench: workbenchInit,
  symptoms: symptomsInit,
  nav: navInit
};

const mockRedux = {
  getState: () => {
    return state
  },
  select: (selector) => of(selector(state)),
  dispatch: (arg: any) => {
  }
};

@Component({
  selector: "mica-symptom-rows",
  template: "<div></div>"
})
class MockRowsComponent {
  @Input() readOnly = false;
  @Input() readonly symptomData: Symptom.Data;
  @Input() dataStoreRefTypes: Workbench.DataStoreRefTypesDictionary;
  @Input() rowsFormArray: FormArray;
  @Input() maxRowsReached: boolean | number;
  @Input() indexVal: number;
  @Output() toggleQuestion: EventEmitter<boolean> = new EventEmitter();
  @Output() errors: EventEmitter<Symptom.RowError[]> = new EventEmitter();
}

@Component({
  selector: "mica-symptom-title-row",
  template: "<div></div>"
})
class MockTitleRowComponent {
  @Input() readOnly = false;
  @Input() readonly symptomData: Symptom.Data;
  @Input() symptomFormGroup: FormGroup;
  @Input() bodyParts: string[] = [];
  @Input() bodyPartsAll: string[] = [];
  @Input() maxRowsReached = false;
  @Input() indexVal: number;
  @Output() check: EventEmitter<boolean> = new EventEmitter();
  @Output() addRow: EventEmitter<boolean> = new EventEmitter();
  @Output() toggleBodyPart: EventEmitter<string> = new EventEmitter();
  @Input() isChecked = false;
  @Input() basicSymptomID: string;
}

describe("SymptomComponent", () => {
  let component: SymptomComponent;
  let fixture: ComponentFixture<SymptomComponent>;
  let redux: NgRedux<State.Root>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        SymptomComponent,
        MockTitleRowComponent,
        MockRowsComponent
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        { provide: TreatmentsApiService, useClass: TreatmentApiServiceStub }
      ],
      imports: [
        BrowserAnimationsModule,
        NgbModule,
        RouterTestingModule.withRoutes(testRoutes)
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    redux = TestBed.get(NgRedux);
    fixture = TestBed.createComponent(SymptomComponent);
    component = fixture.componentInstance;
    (component as any).symptomID = fakeSymptoms[0].symptomID;
    // spyOn(workbenchSelectors, "symptomSourceInformation").and.returnValue(() => ({} as SourceInfo.Symptom))
    spyOn(symptomSelectors, "dataStoreRefTypesByGroup").and.returnValue(() => ({
      refName: {values: [{}, {}]}
    }));
    spyOn(ecwSelectors, "validationSymptomByID").and.returnValue(() => null);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("onSymptomValueChange", () => {
    const mockIsSymptomGroupActiveComplete = spyOn(workbenchSelectors, "isSymptomGroupActiveComplete");
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    const fakeValue = "value";

    spyOn(workbenchActions, "completeSymptomGroup").and.returnValue(fakeValue);

    mockIsSymptomGroupActiveComplete.and.returnValue(true);
    component["onSymptomValueChange"]();
    expect(mockDispatch).toHaveBeenCalledWith(fakeValue);

    mockIsSymptomGroupActiveComplete.and.returnValue(false);
    component["onSymptomValueChange"]();
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it("onCheck", () => {
    const wrapStateValue = "wrapStateValue";
    const deleteSymptomValue = "deleteSymptomValue";
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    const onSymptomValueChangeSpy = spyOn(<any>component, "onSymptomValueChange").and.callFake(() => {});
    const onSymptomValueSpy = spyOn(<any>component, "onSymptomValue").and.callFake(() => {});

    spyOn(stateStore, "wrapState").and.returnValue(wrapStateValue);
    spyOn(workbenchActions, "insertSymptom").and.callFake(() => {});
    spyOn(symptomFactory, "symptomValueFactory").and.callFake(() => {});
    spyOn(symptomSelectors, "symptomDataPath").and.returnValue(() => ["one", "two", "three"]);
    spyOn(workbenchActions, "deleteSymptom").and.returnValue(deleteSymptomValue);

    component.onCheck(true);
    expect(mockDispatch).toHaveBeenCalledWith(wrapStateValue);
    expect(onSymptomValueChangeSpy).toHaveBeenCalled();
    expect(onSymptomValueSpy).toHaveBeenCalled();

    component.onCheck(false);
    expect(mockDispatch).toHaveBeenCalledWith(deleteSymptomValue);
    expect(onSymptomValueChangeSpy).toHaveBeenCalled();
    expect(onSymptomValueSpy).toHaveBeenCalled();
    expect(component.showQ).toBeFalsy();
  });

  it("onCheck readOnly", () => {
    const onSymptomValueChangeSpy = spyOn(<any>component, "onSymptomValueChange").and.callFake(() => {});

    component.readOnly = true;
    component.onCheck(false);
    expect(onSymptomValueChangeSpy).not.toHaveBeenCalled();
  });

  it("onToggleBodyPart", () => {
    const fakeBodyParts = ["head", "abdomen", "chest"];
    const fakeBodyPathControl = new FormControl(fakeBodyParts);
    let fakeBodyPart = "head";
    const result = ["abdomen", "chest"];

    component.symptomFormGroup = new FormGroup({bodyParts: fakeBodyPathControl});
    component.onToggleBodyPart(fakeBodyPart);
    expect(fakeBodyPathControl.value).toEqual(result);

    fakeBodyPart = "legs";
    result.push(fakeBodyPart);
    component.onToggleBodyPart(fakeBodyPart);
    expect(fakeBodyPathControl.value).toEqual(result);

    component.symptomFormGroup = null;
    fakeBodyPart = "feet";
    component.onToggleBodyPart(fakeBodyPart);
    expect(fakeBodyPathControl.value).toEqual(result);
  });

  it("onToggleBodyPart readOnly", () => {
    const spyGet = spyOn(component.symptomFormGroup as FormGroup, "get");

    component.symptomFormGroup = new FormGroup({});
    component.readOnly = true;
    component.onToggleBodyPart("part");
    expect(spyGet).not.toHaveBeenCalled();
  });

  it("onAddRow", () => {
    const fakeSymptom = {bias: true};
    const fakeRows = [fakeSymptom];
    const fakeRowsFormArray = new FormArray(_.map(fakeRows, row => new FormControl(row)));
    const mockDetectChanges = spyOn(component["cd"], "detectChanges").and.callThrough();
    const mockSymptomRowFactory = spyOn(symptomFactory, "symptomRowFactory");
    const resLength = fakeRows.length + 1;

    component.symptomFormGroup = new FormGroup({rows: fakeRowsFormArray});

    mockSymptomRowFactory.and.returnValue(fakeSymptom);
    component.onAddRow();
    expect(mockDetectChanges).toHaveBeenCalled();
    expect(component["rowsCtrl"].length).toEqual(resLength);

    mockSymptomRowFactory.and.returnValue(null);
    component.onAddRow();
    expect(mockDetectChanges).toHaveBeenCalledTimes(1);
    expect(component["rowsCtrl"].length).toEqual(resLength);

    component.symptomFormGroup = null;
    component.onAddRow();
    expect(mockDetectChanges).toHaveBeenCalledTimes(1);
    expect(mockSymptomRowFactory).toHaveBeenCalledTimes(2);
  });

  it("addRow readOnly", () => {
    const mockSymptomRowFactory = spyOn(symptomFactory, "symptomRowFactory");
    component.readOnly = true;
    component.onAddRow();
    expect(mockSymptomRowFactory).not.toHaveBeenCalled();
  });

   it("maxRows", () => {
    component.symptomData.multipleValues = undefined;
    expect(component["maxRows"]).toEqual(1);

    component.symptomData.multipleValues = "refName";
    expect(component["maxRows"]).toEqual(2);

    component.symptomData.multipleValues = "someName";
    expect(component["maxRows"]).toEqual(10000);

    (component as any).dataStoreRefTypes = null;
    expect(() => component["maxRows"]).toThrow(jasmine.any(Error));
  });

  it("bodyPartsValue", () => {
    component.symptomFormGroup = null;
    expect(component.bodyPartsValue).toEqual([]);
  });

  it("bodyPartsValue", () => {
    const parts = "parts";

    component.symptomFormGroup = new FormGroup({"bodyParts": new FormControl(parts)});
    component.bodyPartsAll = ["1", "2"];
    expect(component.bodyPartsValue).toEqual(parts);
  });

  it("ngOnInit should throw error", () => {
    component["requiredInputs"] = ["requiredInput"];
    expect(() => component.ngOnInit()).toThrow();
  });

  it("ngOnDestroy", () => {
    component["ngFormSub"] = null;
    expect(component.ngOnDestroy()).toBeUndefined();
  });

  it("addBodyPartsTracker", () => {
    expect(component["addBodyPartsTracker"](null)).toBeUndefined();
  });

  it("onFormValueChange addRow", () => {
    const addRowSpy = spyOn(component, "onAddRow").and.callThrough();

    spyOn(symptomFactory, "optimizeSymptomValue").and.callFake(value => value);
    component.symptomFormGroup = null;
    component["onFormValueChange"]({
      symptomID: "S7",
      rows: []
    });
    expect(addRowSpy).toHaveBeenCalled();
  });

  it("onFormValueChange readOnly", () => {
    const addRowSpy = spyOn(component, "onAddRow").and.callThrough();

    spyOn(symptomFactory, "optimizeSymptomValue").and.callFake(value => value);
    component.readOnly = true;
    component.symptomFormGroup = null;
    component["onFormValueChange"]({
      symptomID: "S7",
      rows: []
    });
    expect(addRowSpy).not.toHaveBeenCalled();
  });

  it("onFormValueChange", () => {
    const addRowSpy = spyOn(component, "onAddRow").and.callThrough();
    const rows = new FormArray([]);

    spyOn(symptomFactory, "optimizeSymptomValue").and.callFake(value => value);
    component.symptomFormGroup = new FormGroup({rows: rows});
    component["onFormValueChange"]({
      symptomID: "S7",
      rows: []
    });
    expect(addRowSpy).toHaveBeenCalled();
  });

  it("onFormValueChange", () => {
    const rows = new FormArray([new FormControl("")]);
    const addBodyPartsTrackerSpy = spyOn<any>(component, "addBodyPartsTracker").and.callThrough();

    spyOn(symptomFactory, "optimizeSymptomValue").and.callFake(value => value);
    component.bodyParts = ["1"];
    component.symptomFormGroup = new FormGroup({rows: rows});
    component["onFormValueChange"]({
      symptomID: "S7",
      rows: []
    });
    expect(addBodyPartsTrackerSpy).toHaveBeenCalled();
  });

  it("onFormValueChange", () => {
    const rows = new FormArray([new FormControl("")]);
    const symptomValueChangeSpy = spyOn(<any>component, "onSymptomValueChange").and.callThrough();

    spyOn(symptomFactory, "optimizeSymptomValue").and.callFake(value => value);
    component.symptomFormGroup = new FormGroup({rows: rows});
    component["onFormValueChange"]({
      symptomID: "S7",
      rows: []
    });
    expect(symptomValueChangeSpy).toHaveBeenCalled();
  });

  it("onSymptomError", () => {
    expect(component.onSymptomError(null, null)).toBeUndefined();
  });

  it("toggleBodyPartValue", () => {
    const value = "value";
    const active = [value];
    const all = [];

    expect(component["toggleBodyPartValue"](value, active, all).length).toEqual(0);
  });

  it("onPublishError", () => {
    const error = {bodyParts: {}};
    const onSymptomErrorSpy = spyOn(component, "onSymptomError").and.callThrough();

    component["onPublishError"](error);
    expect(onSymptomErrorSpy).toHaveBeenCalledWith(null, error);
  });


  it("onSymptomValue", () => {
    component["ngFormSub"] = of({}).subscribe();
    component["onSymptomValue"](null);
    expect(component.symptomFormGroup).toEqual(null);
  });

  it("onSymptomValue", () => {
    component["ngFormSub"] = null;
    component["onSymptomValue"](null);
    expect(component.symptomFormGroup).toEqual(null);
  });

  it("onSymptomValue", () => {
    const symptomFormGroup = new FormGroup({
      minDiagCriteria: new FormControl(""),
      medNecessary: new FormControl("")
    });
    const addBodyPartsTrackerSpy = spyOn<any>(component, "addBodyPartsTracker").and.callThrough();

    spyOn(symptomFactory, "symptomValueFactory").and.callFake(() => {});
    spyOn(symptomFactory, "processSymptomValue").and.callFake(value => value);
    // spyOn<any>(component, "addRows").and.returnValue({} as Value);
    spyOn<any>(component, "valueSub").and.callFake(() => null);
    spyOn(createFormUtils, "formGroupFactory").and.returnValue(symptomFormGroup);
    component.basicSymptomID = "basicId";
    component.symptomFormGroup = null;
    component["init"] = true;
    component["onSymptomValue"]({} as Value);
    expect(addBodyPartsTrackerSpy).toHaveBeenCalled();
  });

  it("onSymptomValue", () => {
    const symptomFormGroup = new FormGroup({
      minDiagCriteria: new FormControl(""),
      medNecessary: new FormControl("")
    });
    const addBodyPartsTrackerSpy = spyOn<any>(component, "addBodyPartsTracker").and.callThrough();

    spyOn(symptomFactory, "symptomValueFactory").and.callFake(() => {});
    spyOn(workbenchSelectors, "symptomValue").and.returnValue(() => {return {}});
    spyOn(symptomFactory, "processSymptomValue").and.callFake(value => value);
    // spyOn<any>(component, "addRows").and.returnValue({} as Value);
    spyOn<any>(component, "valueSub").and.callFake(() => null);
    spyOn(createFormUtils, "formGroupFactory").and.returnValue(symptomFormGroup);
    component.basicSymptomID = "basicId";
    component.symptomFormGroup = null;
    component["init"] = true;
    component["onSymptomValue"]({} as Value);
    expect(addBodyPartsTrackerSpy).toHaveBeenCalled();
  });

  it("onSymptomValue", () => {
    const symptomFormGroup = new FormGroup({
      minDiagCriteria: new FormControl(""),
      medNecessary: new FormControl("")
    });
    const addBodyPartsTrackerSpy = spyOn<any>(component, "addBodyPartsTracker").and.callThrough();

    spyOn(symptomFactory, "symptomValueFactory").and.callFake(() => {});
    spyOn(workbenchSelectors, "symptomValue").and.returnValue(() => {return {}});
    spyOn(symptomFactory, "processSymptomValue").and.callFake(value => value);
    // spyOn<any>(component, "addRows").and.returnValue(null);
    spyOn<any>(component, "valueSub").and.callFake(() => null);
    spyOn(createFormUtils, "formGroupFactory").and.returnValue(symptomFormGroup);
    component.basicSymptomID = "basicId";
    component.symptomFormGroup = null;
    component["init"] = true;
    component["onSymptomValue"](null);
    expect(addBodyPartsTrackerSpy).not.toHaveBeenCalled();
  });

  it("onSymptomValue", () => {
    const v = {} as Value;
    const addBodyPartsTrackerSpy = spyOn<any>(component, "addBodyPartsTracker").and.callThrough();

    spyOn(createFormUtils, "formGroupFactory").and.returnValue(new FormGroup({}));
    spyOn<any>(component, "valueSub").and.callFake(() => null);
    spyOn(symptomFactory, "processSymptomValue").and.callFake(value => value);
    component.symptomFormGroup = new FormGroup({
      minDiagCriteria: new FormControl("")
    });
    component["ngFormSub"] = of({}).subscribe();
    component["onSymptomValue"](v);
    expect(addBodyPartsTrackerSpy).toHaveBeenCalled();
  });

  it("onSymptomValue", () => {
    const v = {} as Value;
    const addBodyPartsTrackerSpy = spyOn<any>(component, "addBodyPartsTracker").and.callThrough();
    const prepareSymptomValueSpy = spyOn(symptomFactory, "optimizeSymptomValue").and.callFake(value => value);

    spyOn(createFormUtils, "formGroupFactory").and.returnValue(new FormGroup({}));
    spyOn<any>(component, "valueSub").and.callFake(() => null);
    spyOn(symptomFactory, "processSymptomValue").and.callFake(value => value);
    component.symptomFormGroup = new FormGroup({
      minDiagCriteria: new FormControl("")
    });
    component["ngFormSub"] = null;
    component["onSymptomValue"](v);
    expect(addBodyPartsTrackerSpy).toHaveBeenCalled();
    expect(prepareSymptomValueSpy).not.toHaveBeenCalled();
  });

  it("onSymptomValue", () => {
    const v = {} as Value;
    const addBodyPartsTrackerSpy = spyOn<any>(component, "addBodyPartsTracker").and.callThrough();

    spyOn(createFormUtils, "formGroupFactory").and.returnValue(new FormGroup({}));
    spyOn<any>(component, "valueSub").and.callFake(() => null);
    spyOn(symptomFactory, "processSymptomValue").and.callFake(value => value);
    component["init"] = false;
    component.symptomFormGroup = new FormGroup({
      minDiagCriteria: new FormControl("")
    });
    component["ngFormSub"] = null;
    component["onSymptomValue"](v);
    expect(addBodyPartsTrackerSpy).toHaveBeenCalled();
  });

  it("onSymptomValue", () => {
    const v = {} as Value;
    const addBodyPartsTrackerSpy = spyOn<any>(component, "addBodyPartsTracker").and.callThrough();

    spyOn(symptomFactory, "processSymptomValue").and.callFake(value => value);
    component.symptomFormGroup = new FormGroup({});
    component["onSymptomValue"](v);
    expect(addBodyPartsTrackerSpy).not.toHaveBeenCalled();
  });

  it("onSymptomValue readOnly", () => {
    spyOn(symptomFactory, "processSymptomValue").and.callFake(value => value);
    component.symptomFormGroup = new FormGroup({});
    component.readOnly = true;
    component["onSymptomValue"]({} as Value);
    expect(component.symptomFormGroup.disabled).toBeTruthy();
  });


  it("valuesAreEqual", () => {
    expect(component["valuesAreEqual"](1, 1)).toBeTruthy();
  });

  it("ngOnInit", () => {
    spyOnProperty(component, "isChecked", "get").and.returnValue(false);
    component.ngOnInit();
  });

  it("filterValues", () => {
    spyOnProperty(component, "isChecked", "get").and.returnValue(true);
    expect(component["filterValues"](null, 1)).toBeTruthy();
  });

  it("maxRowsReached", () => {
    spyOnProperty<any>(component, "rowsCtrl", "get").and.returnValue(null);
    expect(component.maxRowsReached).toBeFalsy();
  });

  it("maxRowsReached boolean", () => {
    spyOnProperty<any>(component, "maxRows", "get").and.returnValue(2);
    spyOnProperty<any>(component, "rowsCtrl", "get").and.returnValue(
      new FormArray([
        new FormControl({ multiplier: ["value1"] }),
        new FormControl({ multiplier: ["value2"] })
      ])
    );
    expect(component.maxRowsReached).toBeTruthy();
  });

  it("maxRowsReached number", () => {
    spyOnProperty<any>(component, "maxRows", "get").and.returnValue(1);
    spyOnProperty<any>(component, "rowsCtrl", "get").and.returnValue(new FormArray([
      new FormControl({multiplier: ["value1"]} as Symptom.RowValue),
      new FormControl({multiplier: ["value2"]} as Symptom.RowValue),
      new FormControl({multiplier: ["value3"]} as Symptom.RowValue),
      new FormControl({multiplier: [""]} as Symptom.RowValue)
    ]));
    expect(component.maxRowsReached).toBe(3);
  });

  it("ngOnInit", () => {
    const symptomDataSpy = spyOn(symptomSelectors, "symptomData").and.returnValue(() => ({symptomID: "code"}));

    component.ngOnInit();
    expect(symptomDataSpy).toHaveBeenCalled();
  });

});
