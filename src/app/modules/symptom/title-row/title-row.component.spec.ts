import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import * as _ from "lodash";

import { TitleRowComponent } from "./title-row.component";
import { RouterTestingModule } from "@angular/router/testing";
import { testRoutes } from "../../../../test/data/test-routes";
import { TestComponent } from "../../../../test/test.component";
import { SymptomModule } from "../symptom.module";
import { NgRedux } from "@angular-redux/store";
import { TreatmentsApiService } from "../../treatments/services/treatments-api.service";
import { TreatmentApiServiceStub } from "../../../../test/services-stubs/treatment-api-service-stub.service";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { TemplateService } from "app/services/template.service";
import { TemplateServiceStub } from "../../../../test/services-stubs/template.service.stub";
import { defaultState } from "app/app.config";
import Data = Symptom.Data;
import { TOGGLE_EDIT } from "app/state/nav/nav.actions";
import * as workbenchSelectors from "app/state/workbench/workbench.selectors";

const fakeTreatments = require("../../../../test/data/treatments.json");

const state = _.cloneDeep(defaultState);

const mockRedux = {
  getState: () => {
    return state;
  },
  dispatch: (arg: any) => {
  }
};

describe("TitleRowComponent", () => {
  let component: TitleRowComponent;
  let fixture: ComponentFixture<TitleRowComponent>;
  let redux: NgRedux<State.Root>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestComponent
      ],
      providers: [
        {provide: NgRedux, useValue: mockRedux},
        {provide: TreatmentsApiService, useClass: TreatmentApiServiceStub},
        {provide: TemplateService, useClass: TemplateServiceStub}
      ],
      imports: [
        SymptomModule,
        NgbModule,
        RouterTestingModule.withRoutes(testRoutes)
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TitleRowComponent);
    component = fixture.componentInstance;
    (component as any).symptomData = fakeTreatments[0];
    redux = TestBed.get(NgRedux);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("onActivateEditAntithesis", () => {
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    component.symptomData = {symptomID: "17"} as Data;
    component.onActivateEditAntithesis(true);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: TOGGLE_EDIT,
      edit: {
        id: "17",
        index: -1,
        name: "antithesis"
      }
    });
  });

  it("onActivateEditAntithesis", () => {
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    component.symptomData = {symptomID: "17"} as Data;
    component.onActivateEditAntithesis(false);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: TOGGLE_EDIT,
      edit: null
    });
  });

  it("partTrimmed", () => {
    component.bodyPartsAll = ["a", "b", "c"];
    expect(component.partTrimmed("a b c")).toEqual("a b");
  });

  it("partTrimmed", () => {
    component.bodyPartsAll = ["a"];
    const val = "a b c";
    expect(component.partTrimmed(val)).toEqual(val);
  });

  it("onTogglePart", () => {
    const toggleBodyPartSpy = spyOn(component.toggleBodyPart, "emit").and.callThrough();
    component.onTogglePart("part");
    expect(toggleBodyPartSpy).toHaveBeenCalledWith("part");
  });

  it("isBodyPartActive", () => {
    component.bodyParts = ["part"];
    expect(component["isBodyPartActive"]("part")).toBeTruthy();
  });

  it("onDefinitionClick", () => {
    const editSymptomTemplateSpy = spyOn<any>(component["symptomService"], "editSymptomTemplate").and.callThrough();
    component.onDefinitionClick();
    expect(editSymptomTemplateSpy).toHaveBeenCalled();
  });

  it("onCheckBoxClick on Non Basic Symptom", () => {
    const emitSpy = spyOn(component.check, "emit").and.callThrough();
    const event = new MouseEvent("click", { cancelable: true });

    component["isChecked"] =  false;

    component["onCheckBoxClick"](event);
    expect(emitSpy).toHaveBeenCalled();
  });

  it("onCheckBoxClick on Basic Symptom clicked", () => {
    const event = new MouseEvent("click", { cancelable: true });
    const preventDefaultSpy = spyOn(event, "preventDefault").and.callThrough();
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();

    spyOn(workbenchSelectors, "activeMandatorySymptoms").and.returnValue(
      { SYMPT0000191: "SYMPT0000190", SYMPT0000190: "SYMPT0000190" }
    );

    component["isChecked"] =  true;
    component["basicSymptomID"] =  "SYMPT0000190";
    component.symptomData = { symptomID: "SYMPT0000190" } as Symptom.Data;

    component["onCheckBoxClick"](event);
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalled();
  });

});
