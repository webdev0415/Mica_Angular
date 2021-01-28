import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import * as _ from "lodash";

import { EditorComponent } from "./editor.component";
import { TemplateSearchComponent } from "../search/search.component";
import { InlineSpinnerComponent } from "../../../spinner/inline-spinner/inline-spinner.component";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Component, Input } from "@angular/core";
import { defaultState } from "../../../../app.config";
import { NgRedux } from "@angular-redux/store";
import { TemplateService } from "../../../../services/template.service";
import { TemplateServiceStub } from "../../../../../test/services-stubs/template.service.stub";
import { SymptomService } from "app/services/symptom.service";
import { SymptomServiceStub } from "../../../../../test/services-stubs/symtom.service.stub";
import { of } from "rxjs/observable/of";
import Template = Symptom.Template;
import * as createFormUtils from "../../../../util/forms/create";

const state = _.cloneDeep(defaultState);
const mockRedux = {
  getState: () => {
    return state
  },
  select: (selector) => of(selector(defaultState)),
  dispatch: (arg: any) => {
  }
};

@Component({
  selector: "templates-table",
  template: "<div></div>"
})
class MockTableComponent {
  @Input() sympForm: FormGroup;
  @Input() sympData: Symptom.Data;
  @Input() isLabSymptom: boolean;
}

describe("EditorComponent", () => {
  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;
  let symptomService: SymptomServiceStub;
  let templateService: TemplateServiceStub;
  let redux: NgRedux<State.Root>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EditorComponent,
        TemplateSearchComponent,
        InlineSpinnerComponent,
        MockTableComponent
      ],
      providers: [
        { provide: TemplateService, useClass: TemplateServiceStub },
        { provide: SymptomService, useClass: SymptomServiceStub },
        { provide: NgRedux, useValue: mockRedux },
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    redux = TestBed.get(NgRedux);
    symptomService = TestBed.get(SymptomService);
    templateService = TestBed.get(TemplateService);
    fixture = TestBed.createComponent(EditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("onCancel", () => {
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    component.onCancel();
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("onSubmit", () => {
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    const mockSaveTemplate = spyOn(templateService, "saveTemplate");
    const mockRehydrateSymptomGroups = spyOn(symptomService, "rehydrateSymptomGroups").and.callThrough();

    mockSaveTemplate.and.returnValue(of(true));
    component.onSubmit();
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockRehydrateSymptomGroups).toHaveBeenCalled();
  });

  it("shouldShow", () => {
    (state.user as any).email = "serjo@serjo.com";
    expect(component.shouldShow).toBeTruthy();
  });

  it("multiplierValues", () => {
    expect(component.multiplierValues).toEqual([]);
  });

  it("defaultValue", () => {
    const randomProp = state.symptomTemplates.editableProperties[0];
    expect(component["defaultValue"][randomProp.key]).toEqual(randomProp.defaultValue);

  });

  it("shouldShow", () => {
    component.isProduction = true;
    expect(component.shouldShow).toBeFalsy();
  });

  it("setSymptom", () => {
    const consoleSpy = spyOn(console, "warn").and.callThrough();
    spyOnProperty<any>(component, "defaultValue", "get").and.returnValue({});
    component["setSymptom"]({symptomID: "17"} as Template);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("setSymptom", () => {
    const s = {...defaultState};
    Object.assign(s, {symptoms: {entities: {symptoms: {"17": {}}}}});
    spyOnProperty<any>(component, "state", "get").and.returnValue(s);
    spyOnProperty<any>(component, "defaultValue", "get").and.returnValue({});
    expect(component["setSymptom"]({symptomID: "17"} as Template)).toBeUndefined();
  });

  it("onSymptomTemplates", () => {
    const setSymptomSpy = spyOn<any>(component, "setSymptom").and.callFake(() => {});
    const symptomTemplate = {} as Template;
    component["onSymptomTemplates"](symptomTemplate);
    expect(setSymptomSpy).toHaveBeenCalled();
  });

  it("setSymptomDefinition", () => {
    const definitionCtrl = new FormControl("");
    component.sympForm = new FormGroup({
      definition: definitionCtrl
    });
    expect(component["setSymptomDefinition"]()).toBeTruthy();
  });

  it("setSymptom", () => {
    const symptomTemplate = {} as Template;
    spyOnProperty<any>(component, "defaultValue", "get").and.returnValue({});
    component["setSymptom"](symptomTemplate);
    expect(component.sympTemplate).toEqual(symptomTemplate);
  });

  it("setSymptom", () => {
    const symptomTemplate = {} as Template;
    spyOnProperty<any>(component, "defaultValue", "get").and.returnValue({});
    const sympForm = new FormGroup({
      displayDrApp: new FormControl(true),
      genderGroup: new FormControl("\u0000")
    });
    spyOn(createFormUtils, "symptomTemplateCtrlFactory").and.returnValue(sympForm);
    component["formSub"] = of({}).subscribe();
    component["setSymptom"](symptomTemplate);
    expect(component.sympTemplate).toEqual(symptomTemplate);
  });

});
