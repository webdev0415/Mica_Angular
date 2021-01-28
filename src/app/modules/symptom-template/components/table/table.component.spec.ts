import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import * as _ from "lodash";

import { TableComponent } from "./table.component";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, FormArray } from "@angular/forms";
import { Component, Input } from "@angular/core";
import { TitleCasePipe } from "../../../pipes/title-case.pipe";
import { NgRedux } from "@angular-redux/store";
import { defaultState, navInit, symptomsInit, workbenchInit } from "app/app.config";
import { symptomTemplateCtrlFactory } from "app/util/forms/create";
import { RouterTestingModule } from "@angular/router/testing";
import { of } from "rxjs/observable/of";
import EditableMetadata = Symptom.EditableMetadata;
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { OptionNamePipe } from "../../../pipes/option-name.pipe";
import * as groupsSelectors from "app/state/groups/groups.selectors";
import * as labordersSelectors from "app/state/laborders/laborders.selectors";

const testData = require("../../../../../../server/test-storage.json").symptoms.data;
const group = testData[Object.keys(testData)[0]];
const fakeIllnesses: Illness.Normalized.IllnessValue[] = require("../../../../../test/data/illnesses.json");
const fakeSymptoms: Symptom.Data[] = require("../../../../../test/data/symptoms.json");
const fakeCategories: Workbench.Normalized.Category[] = group.categories;
const fakeTemplates = require("../../../../../test/data/templates.json");
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
  selector: "mica-dropdown",
  template: "<div></div>"
})
class MockMicaDropdownComponent {
  @Input() title: string;
  @Input() items: MICA.SelectableEl[];
  @Input() size: string;
  @Input() emptyItem: MICA.SelectableEl;
  @Input() multiSelect?: boolean;
  @Input() controlDisabled?: boolean;
}

@Component({
  selector: "mica-check-switch",
  template: "<div></div>",
})
class MockCheckSwitchComponent {
  @Input() formControl: FormControl;
  @Input() valueNames: string[];
}

@Component({
  selector: "templates-table-value",
  template: "<div></div>",
})
class MockTableValueComponent {
  @Input() required: boolean;
  @Input() value: string | number;
  @Input() label: string;
  @Input() controlDisabled?: boolean;
}

@Component({
  selector: "templates-input",
  template: "<div></div>",
})
class MockInputComponent {
  @Input() formControl: FormControl;
  @Input() title: string | number;
}

@Component({
  selector: "templates-antithesis",
  template: "<div></div>",
})
class MockAntithesisComponent {
  @Input() formControl: boolean;
  @Input() minMaxRange: string | number;
}

@Component({
  selector: "mica-criticality",
  template: "<div></div>",
})
class MockCriticalityComponent {
  @Input() formControl: boolean;
  @Input() max: string | number;
}

@Component({
  selector: "templates-array-input",
  template: "<div></div>",
})
class MockArrayInputComponent {
  @Input() formControl: boolean;
  @Input() title: string | number;
  @Input() type: string;

  writeValue(obj: any) {
  };

  registerOnChange(fn: any) {
  };

  registerOnTouched(fn: any) {
  };
}

@Component({
  selector: "templates-snomed-codes",
  template: "<div></div>",
})
class MockSnomedCodesComponent {
  @Input() ctrl: FormGroup[];
  @Input() title: string | number;
}

@Component({
  selector: "templates-multiplier-value",
  template: "<div></div>",
})
class MockMultiplierValueComponent {
  @Input() arrCtrl: FormGroup[];
  @Input() title: string | number;
}

const mockRedux = {
  getState: () => {
    return defaultState
  },
  select: (selector) => of(selector(defaultState)),
  dispatch: (arg: any) => {
  }
};

describe("TableComponent", () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TableComponent,
        TitleCasePipe,
        MockSnomedCodesComponent,
        MockMultiplierValueComponent,
        MockArrayInputComponent,
        MockTableValueComponent,
        MockInputComponent,
        MockAntithesisComponent,
        MockCheckSwitchComponent,
        MockMicaDropdownComponent,
        MockCriticalityComponent,
        OptionNamePipe
      ],
      providers: [
        {provide: NgRedux, useValue: mockRedux}
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    component.sympForm = symptomTemplateCtrlFactory(fakeTemplates[0], defaultState);
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("trackByFn", () => {
    expect(component.trackByFn(1, null)).toEqual(1);
  });

  it("ngOnInit toBeTruthy", () => {
    expect(component).toBeTruthy();
  });

  it("ngOnInit isLabSymptom", () => {
    component.isLabSymptom = true;
    const getLabordersSpy = spyOn(component, "getLaborders").and.callThrough();
    component.ngOnInit();
    expect(getLabordersSpy).toHaveBeenCalled();
  });

  it("inputType", () => {
    const editableProp = {
      name: "name",
      key: "key",
      defaultValue: 17
    };
    component.editableProperties = [editableProp];
    expect(component.inputType("name")).toEqual("number");
  });

  it("getMinMax", () => {
    const editableProp = {
      name: "name",
      key: "key",
      defaultValue: 17,
      minMax: [0, 1] as [number, number]
    };
    component.editableProperties = [editableProp];
    expect(component.getMinMax("name")).toEqual([0, 1]);
  });


  it("onSubmit", () => {
    const consoleSpy = spyOn(console, "log").and.callThrough();
    component.onSubmit("");
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("inputType", () => {
    component.editableProperties = [{name: "name"} as EditableMetadata];
    expect(component.inputType("")).toEqual("");
  });

  it("getMinMax", () => {
    component.editableProperties = [{minMax: null} as EditableMetadata];
    expect(component.getMinMax("")).toEqual([-1, -1]);
  });


  it("ngOnChanges", () => {
    const getContextSpy = spyOn(component, "getContext").and.callThrough();
    component.rowEdit = "genderGroup";
    component.ngOnChanges();
    expect(component.rowEdit).toBe("");
    expect(getContextSpy).toHaveBeenCalled();
  });

  it("getContext", () => {
    let ctx = component.getContext();
    expect(ctx["snomedCodes"]).toBeDefined();
    expect(ctx["additionalValues"]).toBeDefined();
    const additionalCtrl = component.sympForm.get("additionalInfo") as FormArray;
    const root = additionalCtrl.at(0);
    component.sympForm.setControl("additionalInfo", new FormArray([root]))
    ctx = component.getContext();
    expect(ctx["snomedCodes"]).toBeDefined();
    expect(ctx["additionalValues"]).toBeUndefined();
  });

  it("rows", () => {
    component.sympForm = new FormGroup({
      field: new FormControl("key")
    });
    component.editableProperties = [
      {
        name: "name",
        key: "field"
      } as EditableMetadata
    ];
    const result = component.rows;
    expect(result.length).toEqual(1);
    const first = result[0];
    expect(first[0]).toEqual("name");
    expect((first[1] as FormControl).value).toEqual("key");
  });

  it("calcAdditinalInfo", () => {
    const form = component.sympForm;
    form.setControl("additionalInfo", new FormArray([
      new FormGroup({
        optionCode: new FormControl(""),
        optionDescription: new FormControl(""),
        icd10RCodes: new FormControl(),
        snomedCodes: new FormControl([])
      })
    ]));
    const {rootOptionCtrl, arrCtrl} = component.calcAdditionalInfo();
    expect(rootOptionCtrl.get("antithesis")).toBeDefined();
    expect((rootOptionCtrl.get("icd10RCodes") as FormControl).value).toEqual([]);
    expect(rootOptionCtrl.get("snomedCodes") instanceof FormArray).toBeTruthy();
    expect(arrCtrl.length).toBe(0);
  });

  it("getSymptomGroups", () => {
    const groups = [{name: "one", groupID: 1}];

    spyOn(groupsSelectors, "allGroupsSelector").and.returnValue(groups);
    component.getSymptomGroups();
    expect(component.groupList.length).toEqual(groups.length);
    expect(component.symptomGroups.length).toEqual(groups.length);
  });

  it("getLaborders", () => {
    const laborders = [{ name: "one", orderID: 1 }];

    spyOn(labordersSelectors, "allLabordersSelector").and.returnValue(laborders);
    component.getLaborders();
    expect(component.laborderList.length).toEqual(laborders.length);
    expect(component.labordered.length).toEqual(laborders.length);
  })

});
