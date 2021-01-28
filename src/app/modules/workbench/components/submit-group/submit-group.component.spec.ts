import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import * as _ from "lodash";
import {SubmitGroupComponent} from "./submit-group.component";
import {InlineSpinnerComponent} from "../../../spinner/inline-spinner/inline-spinner.component";
import {IllnessService} from "../../../../services/illness.service";
import {IllnessServiceStub} from "../../../../../test/services-stubs/illness.service.stub";
import {defaultState, navInit} from "../../../../app.config";
import {NgRedux, NgReduxModule} from "@angular-redux/store";
import {NgReduxTestingModule} from "@angular-redux/store/testing";
import {ValidationService} from "../../../validation/validation.service";
import {ValidationServiceStub} from "../../../../../test/services-stubs/validation.service.stub";
import {WorkbenchService} from "../../services/workbench.service";
import {WorkbenchServiceStub} from "../../../../../test/services-stubs/workbench.service.stub";
import {AuthService} from "../../../../services/auth.service";
import {AuthServiceStub} from "../../../../../test/services-stubs/auth.service.stub";
import {Router} from "@angular/router";
import {of} from "rxjs/observable/of";
const fakeUsers = require("../../../../../test/data/users.json");
const state = _.cloneDeep(defaultState);
import * as workbenchSelectors from "../../../../state/workbench/workbench.selectors";
import * as denormalizedModel from "../../../../state/denormalized.model";
import {CorrectSpellingPipe} from "../../../pipes/correct-spelling.pipe";
import * as illnessUtil from "../../../../util/data/illness";

(state as any).user = fakeUsers[0];

const mockRouter = {
  navigate: jasmine.createSpy("navigate")
};

const mockRedux = {
  getState: () => state,
  dispatch: (arg: any) => {
  }
};

describe("SubmitGroupComponent", () => {
  let component: SubmitGroupComponent;
  let fixture: ComponentFixture<SubmitGroupComponent>;
  let redux: NgRedux<State.Root>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SubmitGroupComponent,
        InlineSpinnerComponent,
        CorrectSpellingPipe
      ],
      providers: [
        {provide: NgRedux, useValue: mockRedux},
        {provide: Router, useValue: mockRouter},
        {provide: NgReduxModule, useClass: NgReduxTestingModule},
        {provide: IllnessService, useClass: IllnessServiceStub},
        {provide: ValidationService, useClass: ValidationServiceStub},
        {provide: WorkbenchService, useClass: WorkbenchServiceStub},
        {provide: AuthService, useClass: AuthServiceStub}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    redux = TestBed.get(NgRedux);
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("onSGComplete", () => {
    spyOnProperty(component["auth"], "isAuthenticated$", "get").and.returnValue(of(false));
    const showWidgetSpy = spyOn(component["auth"], "showWidget").and.callThrough();
    component.onSGComplete();
    expect(showWidgetSpy).toHaveBeenCalled();
  });

  it("onSGComplete", () => {
    const updatedState = {...defaultState};
    Object.assign(updatedState, {workbench: {illnesses: {active: "17", values: {}}}});
    spyOnProperty<any>(component, "state", "get").and.returnValue(updatedState);
    expect(component.onSGComplete()).toBeUndefined();
  });

  it("onSGComplete", () => {
    spyOn(workbenchSelectors, "activeIllnessValue").and.returnValue({});
    const syncSpy = spyOn<any>(component, "syncIllData").and.callFake(() => {});
    component.onSGComplete();
    expect(syncSpy).toHaveBeenCalled();
  });

  it("syncIllData", () => {
    expect(() => component["syncIllData"](null, "")).toThrow();
  });

  it("syncIllData", () => {
    spyOn(denormalizedModel, "denormalizeIllnessValue").and.returnValue({idIcd10Code: "17"});
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    component["syncIllData"]({} as any, "name");
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("btnType", () => {
    spyOnProperty(component, "isComplete", "get").and.returnValue(of(true));
    component.ngOnInit();
    component.btnType.subscribe(val => {
      expect(val).toEqual("locked");
    });
  });

  it("btnType", () => {
    spyOnProperty(component, "isComplete", "get").and.returnValue(of(false));
    component.ngOnInit();
    component.btnType.subscribe(val => {
      expect(val).toEqual("submit");
    });
  });

});
