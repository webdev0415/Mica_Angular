import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import * as _ from "lodash";

import { WorkbenchPainLayoutComponent } from "./layout.component";
import { TitleCasePipe } from "../../../../../pipes/title-case.pipe";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ValueSwitchComponent } from "../../../../../gui-widgets/components/value-switch/value-switch.component";
import { Component, EventEmitter, Input, Output, TemplateRef } from "@angular/core";
import { DropdownContext } from "../../../../../typeahead/dropdown/dropdown.component";
import { NgRedux } from "@angular-redux/store";
import { defaultState } from "app/app.config";
import { RouterTestingModule } from "@angular/router/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import * as navActions from "app/state/nav/nav.actions";
import * as workbenchSelectors from "app/state/workbench/workbench.selectors";
import * as symptomSelectors from "app/state/symptoms/symptoms.selectors";
import * as workbenchActions from "app/state/workbench/workbench.actions";
import * as symptomFactory from "../../../../../symptom/symptom.factory";
import { of } from "rxjs/observable/of";
import Data = Symptom.Data;
import Value = Symptom.Value;
const fakeSymptoms = require("../../../../../../../test/data/symptoms.json");
const svgShapesPhysical = require("../../../../../../../test/data/svgShapesPhysical.json");
const fakeIllnesses = _.cloneDeep(require("../../../../../../../test/data/illnesses.json"));
const state = _.cloneDeep(defaultState);
const mockRedux = {
  getState: (): State.Root => state,
  select: (selector) => of(selector(state)),
  dispatch: (arg: any) => {}
};

@Component({
  selector: "mica-typeahead",
  template: "<div></div>"
})
class MockTypeaheadComponent {
  @Input() title = "";
  @Input() enableValidation = true;
  @Input() canClose = true;
  @Input() small = false;
  @Input() typeAheadMin = 2;
  @Input() valueValid: string;
  @Input() excludeItems: string[] = [];
  @Input() resultKey: "name" | "value";
  @Input() placeholder = "Search...";
  @Input() items: MICA.SelectableEl[]; // will be of type static
  @Input() urlQuery = "";
  @Input() liveSearchType: MICA.LiveSearchType; // will be of type liveSearch
  @Input() templateRef: TemplateRef<DropdownContext>;
  @Input() dropdownAlignment = "left";
  @Input() sortByKey: string | string[] = "name";
  @Input() required = true;
  @Output() close: EventEmitter<boolean> = new EventEmitter();
}

@Component({
  selector: "workbench-symptoms-list",
  template: "<div></div>"
})
class MockSymptomsListComponent {
  @Input() categoryID: string;
  @Input() bodyView: string;
  @Input() bodyParts: string[] = [];
  @Input() bodyPartsAll: string[] = [];
}

@Component({
  selector: "mica-body-selector",
  template: "<div></div>"
})
class MockBodySelector {
  @Input() selectionBehaviour: string;
  @Input() bodyViewsNames: string[];
  @Input() defaultViewIndex: number;
  @Input() defaultZone: string;
  @Input() defaultBodyPart: string;
  @Input() svgShapes: MICA.BodyImage.ViewSVGMap;
  @Input() defaultViewName: string;
  @Input() wholeBody: string;
  @Input() selectedBodyParts: string[];

  @Output() bodyPartChange: EventEmitter<MICA.BodyImage.Output> = new EventEmitter();
}

describe("WorkbenchPainLayoutComponent", () => {
  let component: WorkbenchPainLayoutComponent;
  let fixture: ComponentFixture<WorkbenchPainLayoutComponent>;
  let redux: NgRedux<State.Root>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        WorkbenchPainLayoutComponent,
        MockSymptomsListComponent,
        MockBodySelector,
        TitleCasePipe,
        ValueSwitchComponent,
        MockTypeaheadComponent
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux }
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        BrowserAnimationsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    redux = TestBed.get(NgRedux);
    fixture = TestBed.createComponent(WorkbenchPainLayoutComponent);
    component = fixture.componentInstance;
    spyOn(symptomSelectors, "dataStoreRefTypesByGroup").and.returnValue(() => null);
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("onSectionChange", () => {
    const section = "section";
    const mockActiveSectionSet = spyOn(navActions, "activeSectionSet").and.callThrough();
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    component.onSectionChange(section, new Event("click"));
    expect(mockActiveSectionSet).toHaveBeenCalledWith(section);
    expect(mockDispatch).toHaveBeenCalledWith(mockActiveSectionSet.calls.mostRecent().returnValue);
  });

  it("onBodyPartSelect", () => {
    const mockGetCatID = spyOn(component, "getCatID");
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    const group = _.find(svgShapesPhysical.general.front.Head, group => !!group.groupName);
    const shapes = _.map(group.shapes, "name");
    const path = ["general", "front", group.groupName as string, shapes as string[]];
    const bodyParts: string[] = [];
    const input = {
      selectedPath: path,
      bodyParts: bodyParts
    } as MICA.BodyImage.Output;
    const catID = "catID";

    mockGetCatID.and.returnValue(catID);
    component.onBodyPartSelect(input);
    expect(component.selectedBodyParts.length).toEqual(0);

    bodyParts.push("Head");
    component.onBodyPartSelect(input);
    expect(component.selectedBodyParts[0]).toEqual({
      name: bodyParts[0],
      value: catID
    });

    bodyParts.push("Back");
    mockGetCatID.and.throwError("error");
    component.onBodyPartSelect(input);
    expect(mockDispatch.calls.mostRecent().args[0].options.type).toEqual("warning");
  });

  it("onBodyPartRemove", () => {
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    const symptom = fakeSymptoms[0];
    const symptoms = [symptom.symptomID];
    const selectableEl = {
      name: "name",
      value: {
        symptoms: symptoms
      }
    };
    spyOn(workbenchSelectors, "activeCategoryValue").and.callFake(val => state => val);
    spyOn(symptomSelectors, "symptomDataPath").and.callFake(val => state => val);

    component.onBodyPartRemove(selectableEl);
    expect(mockDispatch).toHaveBeenCalledWith(workbenchActions.deleteSymptom(symptom.symptomID, symptom.symptomID));

    selectableEl.value = null;
    component.onBodyPartRemove(selectableEl);
    expect(mockDispatch).toHaveBeenCalledTimes(symptoms.length);
  });

  it("onCopySymptoms", () => {
    const spyOnSaveSymptom = spyOn(workbenchActions, "saveSymptom").and.callThrough();
    const spyOnDispatch = spyOn(redux, "dispatch").and.callThrough();
    const spyInsertSymptom = spyOn(workbenchActions, "insertSymptom").and.callThrough();
    const spyOnActiveSectionCatsValue = spyOn(workbenchSelectors, "activeSectionCatsValue").and.callThrough();
    const illness: Illness.Normalized.IllnessValue = _.cloneDeep(fakeIllnesses[0]);
    const symptoms: Symptom.Value[] = _.map(_.cloneDeep(illness.entities.symptoms), (val, key) => val);
    const symptom1: Symptom.Value = symptoms[0];
    const symptom2: Symptom.Value = symptoms[1];
    const copyFormValue = {
      direction: "from",
      bodyPartSelected: symptom1.bodyParts[0]
    };
    let trigger = symptom2.bodyParts[0];
    const section = illness.entities.sections[Object.keys(illness.entities.sections)[0]];

    (state.symptoms as any).entities = _.cloneDeep(illness.entities);
    (state.workbench.illnesses as any).active = illness.form.idIcd10Code;
    (state.workbench as any).readOnlyIllness = illness;
    (state.nav as any).activeSection = section.sectionID;

    component.onCopySymptoms(copyFormValue, trigger);
    expect(spyOnSaveSymptom).toHaveBeenCalledWith({...symptom1, symptomID: symptom2.symptomID});
    spyOnSaveSymptom.calls.reset();

    trigger = symptom2.bodyParts[0];
    delete illness.entities.symptoms[symptom2.symptomID];
    component.onCopySymptoms(copyFormValue, trigger);
    // console.log(spyInsertSymptom.calls.mostRecent().args[0], symptom2);

    spyOnActiveSectionCatsValue.and.returnValue(null);
    component.onCopySymptoms(copyFormValue, trigger);
    expect(spyOnSaveSymptom).not.toHaveBeenCalled();
  });

  it("onCopySymptoms", () => {
    const spyOnSaveSymptom = spyOn(workbenchActions, "saveSymptom").and.callThrough();
    const spyOnDispatch = spyOn(redux, "dispatch").and.callThrough();
    const spyInsertSymptom = spyOn(workbenchActions, "insertSymptom").and.callThrough();
    const spyOnActiveSectionCatsValue = spyOn(workbenchSelectors, "activeSectionCatsValue").and.callThrough();
    const illness: Illness.Normalized.IllnessValue = _.cloneDeep(fakeIllnesses[0]);
    const symptoms: Symptom.Value[] = _.map(_.cloneDeep(illness.entities.symptoms), (val, key) => val);
    const symptom1: Symptom.Value = symptoms[0];
    const symptom2: Symptom.Value = symptoms[1];
    const copyFormValue = {
      direction: "from",
      bodyPartSelected: symptom1.bodyParts[0]
    };
    const trigger = symptom2.bodyParts[0];
    const section = illness.entities.sections[Object.keys(illness.entities.sections)[0]];
    const s = _.cloneDeep(defaultState);
    (s.symptoms as any).entities = _.cloneDeep(illness.entities);
    (s.workbench.illnesses as any).active = illness.form.idIcd10Code;
    (s.workbench as any).readOnlyIllness = illness;
    (s.nav as any).activeSection = section.sectionID;
    spyOnProperty<any>(component, "state", "get").and.returnValue(s);
    spyOn<any>(component, "getSymptomsData").and.returnValue({});
    component.onCopySymptoms(copyFormValue, trigger);
  });

  it("onCopySymptoms", () => {
    const spyOnSaveSymptom = spyOn(workbenchActions, "saveSymptom").and.callThrough();
    const spyOnActiveSectionCatsValue = spyOn(workbenchSelectors, "activeSectionCatsValue").and.callThrough();
    const illness: Illness.Normalized.IllnessValue = _.cloneDeep(fakeIllnesses[0]);
    const symptoms: Symptom.Value[] = _.map(_.cloneDeep(illness.entities.symptoms), (val, key) => val);
    const symptom1: Symptom.Value = symptoms[0];
    const symptom2: Symptom.Value = symptoms[1];
    const copyFormValue = {
      direction: "from",
      bodyPartSelected: symptom1.bodyParts[0]
    };
    const trigger = symptom2.bodyParts[0];
    const section = illness.entities.sections[Object.keys(illness.entities.sections)[0]];
    const s = _.cloneDeep(defaultState);
    (s.symptoms as any).entities = _.cloneDeep(illness.entities);
    (s.workbench.illnesses as any).active = illness.form.idIcd10Code;
    (s.workbench as any).readOnlyIllness = illness;
    (s.nav as any).activeSection = section.sectionID;
    spyOnProperty<any>(component, "state", "get").and.returnValue(s);
    spyOn(symptomFactory, "symptomValueFactory").and.callFake(() => {});
    spyOn<any>(component, "getSymptomToValue").and.returnValue({});
    spyOn<any>(component, "getSymptomFromValue").and.returnValue(null);
    expect(component.onCopySymptoms(copyFormValue, trigger)).toBeUndefined();
  });



  it("sectionNameFromID", () => {
    const section = {
      name: "name",
      sectionID: "ID",
      categories: []
    };
    const s = _.cloneDeep(defaultState);
    s.symptoms.entities.sections[section.sectionID] = section;
    spyOnProperty<any>(component, "state", "get").and.returnValue(s);
    expect(component.sectionNameFromID(section.sectionID)).toEqual(section.name);
  });

  it("getCatID", () => {
    const section = {
      name: "name",
      sectionID: "ID",
      categories: []
    };
    const id = "ID";
    const res = "res";
    spyOn(symptomSelectors, "catIDFromName").and.returnValue(() => res);
    spyOn(symptomSelectors, "activeSectionData").and.returnValue(section);
    expect(component.getCatID(id)).toEqual(res);
  });

  it("deleteSymptoms", () => {
    const symptomsFromUncheckedPainIDs = [17];
    const symptomsToData = [
      {
        painSwellingID: 17,
        symptomID: "17"
      } as Data
    ];
    const symptomsToValue = [
      {
        symptomID: "17"
      } as Value
    ];
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    component["deleteSymptoms"](symptomsFromUncheckedPainIDs, symptomsToData, symptomsToValue);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("deleteSymptoms", () => {
    const symptomsFromUncheckedPainIDs = [17];
    const symptomsToData = [
      {
        painSwellingID: 17,
        symptomID: "17"
      } as Data
    ];
    const symptomsToValue = [
      {
        symptomID: "18"
      } as Value
    ];
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    component["deleteSymptoms"](symptomsFromUncheckedPainIDs, symptomsToData, symptomsToValue);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("deleteSymptoms", () => {
    const symptomsFromUncheckedPainIDs = [18];
    const symptomsToData = [
      {
        painSwellingID: 17,
        symptomID: "17"
      } as Data
    ];
    const symptomsToValue = [
      {
        symptomID: "18"
      } as Value
    ];
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    component["deleteSymptoms"](symptomsFromUncheckedPainIDs, symptomsToData, symptomsToValue);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("onBodyPartSelect", () => {
    const input = {
      selectedPath: ["1", "2", "Whole Body", ["4"], "5"]
    } as any;
    expect(component.onBodyPartSelect(input)).toBeUndefined();
  });

  it("getBodyParts", () => {
    const s = {...defaultState};
    Object.assign(s, {symptoms: {entities: {categories: {"17": {}}}}});
    const cats = [
      {
        categoryID: "17",
        symptoms: ["17"]
      } as Illness.Normalized.FormValueCategory
    ];
    spyOnProperty<any>(component, "state", "get").and.returnValue(s);
    expect(component["getBodyParts"](cats).length).toEqual(1);
  });

  it("getBodyParts", () => {
    const s = {...defaultState};
    Object.assign(s, {symptoms: {entities: {categories: {"18": {}}}}});
    const cats = [
      {
        categoryID: "17",
        symptoms: ["17"]
      } as Illness.Normalized.FormValueCategory
    ];
    spyOnProperty<any>(component, "state", "get").and.returnValue(s);
    expect(component["getBodyParts"](cats).length).toEqual(0);
  });

  it("getBodyParts", () => {
    const s = {...defaultState};
    Object.assign(s, {symptoms: {entities: {categories: {"17": {}}}}});
    const cats = [
      {
        categoryID: "17",
        symptoms: []
      } as Illness.Normalized.FormValueCategory
    ];
    spyOnProperty<any>(component, "state", "get").and.returnValue(s);
    expect(component["getBodyParts"](cats).length).toEqual(0);
  });

  it("onCopySymptoms", () => {
    spyOn(workbenchSelectors, "activeSectionCatsValue").and.returnValue([]);
    spyOn(component, "getCatID").and.returnValue("17");
    const trigger = "trigger";
    const param = {
      direction: "to",
      bodyPartSelected: "part"
    };
    expect(component.onCopySymptoms(param, trigger)).toBeUndefined();
  });

  it("onCopySymptoms", () => {
    spyOn(workbenchSelectors, "activeSectionCatsValue").and.returnValue([]);
    spyOn(component, "getCatID").and.returnValue("17");
    spyOn(symptomSelectors, "catDataDenormalized").and.returnValues(() => {return {symptoms: {symptomID: "id"}}}, () => null);
    const trigger = "trigger";
    const param = {
      direction: "to",
      bodyPartSelected: "part"
    };
    const consoleSpy = spyOn(console, "error").and.callThrough();
    expect(component.onCopySymptoms(param, trigger)).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("exists", () => {
    expect(component["exists"]("")).toBeFalsy();
  });

  it("setDefaultBodyPart", () => {
    const part = "part";
    component["setDefaultBodyPart"](part);
    expect(component.defaultBodyPart).toEqual(part);
  });

  it("onActiveSectionData", () => {
    component["onActiveSectionData"]();
    expect(component.selectedBodyParts).toBeDefined();
  });

  it("getSymptomsData", () => {
    expect(component["getSymptomsData"]("id", [], {})).toBeDefined();
  });

  it("getSymptomToValue", () => {
    spyOn(workbenchSelectors, "activeSectionCatsValue").and.returnValue({});
    const direction = "to";
    expect(component["getSymptomToValue"](() => {}, direction, "", "", {})).toBeUndefined();
  });

  it("getSymptomToValue", () => {
    spyOn(workbenchSelectors, "activeSectionCatsValue").and.returnValue(null);
    const direction = "to";
    expect(component["getSymptomToValue"](() => {}, direction, "", "", {})).toBeUndefined();
  });

  it("onBodyPartSelect", () => {
    const input = {
      selectedPath: ["", "", "Whole Body", [""]],
      bodyParts: [""]
    } as MICA.BodyImage.Output;
    expect(component.onBodyPartSelect(input)).toBeUndefined();
  });

});
