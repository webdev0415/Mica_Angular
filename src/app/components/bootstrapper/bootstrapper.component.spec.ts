import { async, ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { ErrorBoxComponent } from "app/modules/error-reporting/box/box.component";
import { NgRedux, NgReduxModule } from "@angular-redux/store";
import { NgReduxTestingModule } from "@angular-redux/store/testing";
import { RouterTestingModule } from "@angular/router/testing";
import * as _ from "lodash";

import { BootstrapperComponent } from "./bootstrapper.component";
import { globalStateInit, navInit } from "app/app.config";
import { AuthService, IllnessService, SymptomService, SourceService, LaborderService, GroupService } from "app/services";
import { AuthServiceStub } from "../../../test/services-stubs/auth.service.stub";
import { SymptomServiceStub } from "../../../test/services-stubs/symtom.service.stub";
import { BehaviorSubject, EMPTY, throwError } from "rxjs";
import { IllnessServiceStub } from "../../../test/services-stubs/illness.service.stub";
import { of } from "rxjs/observable/of";
import * as userSelectors from "app/state/user/user.selectors";
import * as workbenchSelectors from "app/state/workbench/workbench.selectors";
import DataShort = Illness.DataShort;
import FormValue = Illness.FormValue;
import { SourceServiceStub } from "../../../test/services-stubs/source.service.stub";
import { GroupsServiceStub } from "../../../test/services-stubs/groups.service.stub";
import { LabordersServiceStub } from "../../../test/services-stubs/laborders.service.stub";

const fakeUsers = require("../../../test/data/users.json");
const fakeIllnesses = require("../../../test/data/illnesses.json");
const fakeSymptoms = require("../../../../server/test-storage.json").symptoms.data;

globalStateInit.version = "1.0.0";

const state: State.Root = {
  global: _.assign({}, globalStateInit),
  user: fakeUsers[0],
  nav: navInit
} as State.Root;

const mockRedux = {
  getState: () => {
    return state
  },
  dispatch: (arg: any) => {
  }
};

describe("BootstrapperComponent", () => {
  let component: BootstrapperComponent;
  let fixture: ComponentFixture<BootstrapperComponent>;
  let illnessService: IllnessServiceStub;
  let symptomService: SymptomServiceStub;
  let sourceService: SourceService;
  let authService: AuthServiceStub;
  let groupService: GroupsServiceStub;
  let laborderService: LabordersServiceStub;
  let redux: NgRedux<State.Root>;
  let route: ActivatedRoute;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        BootstrapperComponent,
        ErrorBoxComponent
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        { provide: NgReduxModule, useClass: NgReduxTestingModule },
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: SymptomService, useClass: SymptomServiceStub },
        { provide: IllnessService, useClass: IllnessServiceStub },
        { provide: SourceService, useClass: SourceServiceStub },
        { provide: GroupService, useClass: GroupsServiceStub },
        { provide: LaborderService, useClass: LabordersServiceStub }
      ],
      imports: [
        RouterTestingModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    symptomService = TestBed.get(SymptomService);
    authService = TestBed.get(AuthService);
    illnessService = TestBed.get(IllnessService);
    sourceService = TestBed.get(SourceService);
    groupService = TestBed.get(GroupService);
    laborderService = TestBed.get(LaborderService);
    redux = TestBed.get(NgRedux);
    route = TestBed.get(ActivatedRoute);

    authService.auth0State.next(fakeUsers[0]);
    route.queryParams = EMPTY;
  });

  it("should create with old version", () => {
    (state.global as any).version = "0.0.0";
    fixture = TestBed.createComponent(BootstrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("should create with new version", () => {
    (state.global as any).version = "2.0.0";
    fixture = TestBed.createComponent(BootstrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BootstrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("actionCSSClass should work", () => {
    let val = (component as any).actionCSSClass("identity", {stepsCompleted: new Set(["identity"])});

    expect(val).toEqual("list-group-item-success");
    val = (component as any).actionCSSClass("identity", {stepsStarted: new Set(["identity"])});
    expect(val).toEqual("list-group-item-warning");
    val = (component as any).actionCSSClass("identity", {stepsCompleted: new Set()});
    expect(val).toEqual("");
  });

  it("actionLabel should work", () => {
    let res = (component as any).actionLabel("identity", {stepsCompleted: new Set(["identity"])});

    expect(res).toEqual("done");
    res = (component as any).actionLabel("identity", {stepsStarted: new Set(["identity"])});
    expect(res).toEqual("hourglass_full");
    res = (component as any).actionLabel("identity", {stepsCompleted: new Set()});
    expect(res).toEqual("hourglass_empty");
  });

  it("syncIllnesses should change progress", () => {
    const illness = fakeIllnesses[0];
    const user = fakeUsers[0];
    const progress = component.progress.value;
    const should = {
      finished: progress.finished,
      symptomGroupsLoaded: progress.symptomGroupsLoaded,
      progress: progress.progress + (component as any).progressWeights.sync,
      stepsStarted: progress.stepsStarted || new Set(),
      stepsCompleted: (progress.stepsCompleted || new Set()).add([component.steps.identity] as any)
    };

    (<any>state).user = user;
    spyOn(illnessService, "getUserIllnessSavedByState").and.returnValue(of(illness.form));
    (component as any).syncIllnesses().subscribe();
    expect((component.progress.value as any)).toEqual(should);
  });

  it("syncIllnesses should getIllness properly", () => {
    const illness = fakeIllnesses[0];
    const user = fakeUsers[0];
    const states = (component as any).state.global.illStates;
    const mockIllnessByState = spyOn(illnessService, "getUserIllnessSavedByState").and.returnValue(of(illness.form));

    (<any>state).user = user;
    user.roleName = "collector";
    (component as any).syncIllnesses();
    expect(mockIllnessByState).toHaveBeenCalledWith([states.pending]);
    user.roleName = "reviewer";
    (component as any).syncIllnesses();
    expect(mockIllnessByState).toHaveBeenCalledWith([states.readyForReview]);
  });

  it("loadSGStream should change progress", () => {
    const progress = component.progress.value;
    const should = {
      finished: progress.finished,
      symptomGroupsLoaded: progress.symptomGroupsLoaded + 1,
      progress: progress.progress + (component as any).progressWeights.symptomGroups / state.nav.symptomItems.length,
      stepsStarted: progress.stepsStarted || new Set(),
      stepsCompleted: (progress.stepsCompleted || new Set()).add([component.steps.identity] as any)
    };

    spyOn(symptomService, "symptomGroupAll").and.returnValue(of(fakeSymptoms[_.keys(fakeSymptoms)[0]]));
    (component as any).loadSGStream().subscribe();
    expect((component.progress.value as any)).toEqual(should);
  });

  it("loadSGStream should handle error", fakeAsync(() => {
    spyOn(symptomService, "symptomGroupAll").and.returnValue(throwError(new Error()));
    expect(() => {
      (component as any).loadSGStream().subscribe();
      tick();
    }).toThrowError();
  }));

  it("identityCheck should dispatch a new user", () => {    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    authService.auth0State.next(fakeUsers[1]);
    (component as any).identityCheck().subscribe();
    expect(mockDispatch).toHaveBeenCalledWith({type: "RESET_STATE"});
  });

  it("identityCheck shouldn't dispatch user change", fakeAsync(() => {
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    const mockProgressToken = spyOn<any>(component, "progressToken").and.returnValue({});

    authService.auth0State.next(fakeUsers[0]);
    (component as any).identityCheck().subscribe();
    tick();
    expect(mockDispatch).not.toHaveBeenCalledWith({ type: "RESET_STATE" });
    expect(mockProgressToken).toHaveBeenCalled();
  }));

  it("progressToken should return proper progress", () => {
    const defaultProgress = {
      finished: false,
      symptomGroupsLoaded: 0,
      progress: (component as any).progressWeights.init,
      stepsStarted: new Set(),
      stepsCompleted: new Set()
    };
    const nextProgress = {
      finished: true,
      symptomGroupsLoaded: 1,
      progress: 1,
      stepStarted: component.steps.sync,
      stepCompleted: component.steps.identity
    };
    let res = (component as any).progressToken(defaultProgress, nextProgress);

    expect(res.finished).toEqual(nextProgress.finished || defaultProgress.finished);
    expect(res.progress).toEqual(defaultProgress.progress + nextProgress.progress);
    expect(res.stepsStarted.has(nextProgress.stepStarted)).toBeTruthy();
    expect(res.stepsCompleted.has(nextProgress.stepCompleted)).toBeTruthy();

    delete defaultProgress.progress;
    delete defaultProgress.stepsStarted;
    delete defaultProgress.stepsCompleted;

    res = (component as any).progressToken(defaultProgress, nextProgress);
    expect(res.finished).toEqual(nextProgress.finished || defaultProgress.finished);
    expect(res.progress).toEqual(nextProgress.progress);
    expect(res.stepsStarted.has(nextProgress.stepStarted)).toBeTruthy();
    expect(res.stepsCompleted.has(nextProgress.stepCompleted)).toBeTruthy();
  });

  it("setReturnUrl", () => {
    const params = {
      returnUrl: "url"
    };

    component["returnUrl"] = "";
    component["setReturnUrl"](params);
    expect(component["returnUrl"]).toEqual(params.returnUrl);
  });

  it("onSymptomGroups", () => {
    spyOn(userSelectors, "isReviewer").and.returnValue(true);
    spyOnProperty<any>(component, "loadDefinitions", "get").and.returnValue(of({}));
    expect(component["onSymptomGroups"]()).toBeDefined();
  });

  it("onSymptomGroups", () => {
    spyOn(userSelectors, "isReviewer").and.returnValue(false);
    expect(component["onSymptomGroups"]()).toBeDefined();
  });

  it("onSyncIllnesses", () => {
    const mockDispatch = spyOn(mockRedux, "dispatch").and.callThrough();

    spyOn(workbenchSelectors, "illnessValues").and.returnValue([]);
    component["onSyncIllnesses"]([]);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("onSyncIllnesses", () => {
    const mockDispatch = spyOn(mockRedux, "dispatch").and.callThrough();

    spyOn(workbenchSelectors, "illnessValues").and.returnValue([{}]);
    component["onSyncIllnesses"]([]);
    expect(symptomService.symptomGroupAll()).toBeUndefined();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("onSyncIllnesses", () => {
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();
    const syncIllnesses = [
      {
        name: "illness"
      } as FormValue
    ];

    spyOn(workbenchSelectors, "illnessValues").and.returnValue([]);
    component["onSyncIllnesses"](syncIllnesses);
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
  });

  it("onComplete", () => {
    const nextSpy = spyOn(component.progress, "next").and.callThrough();
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();
    const navigateSpy = spyOn(component["router"], "navigate").and.callThrough();

    spyOn(component, "progress").and.returnValue(new BehaviorSubject({}));
    component["onComplete"]();
    expect(nextSpy).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalled();
  });

  it("setSyncProgress", () => {
    const nextSpy = spyOn(component.progress, "next").and.callThrough();

    component["setSyncProgress"]();
    expect(nextSpy).toHaveBeenCalled();
  });

  it("loadIllnessesStream", () => {
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();

    spyOn(component["illnessSvc"], "getIllnesses").and.returnValue(of([{icd10Code: "A"} as DataShort]));
    component["loadIllnessesStream"]().subscribe(ills => {
      expect(ills.length).toEqual(1);
      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  it("loadDefinitions", () => {
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();
    const definitions = [
      { code: "code" }
    ];

    spyOn(component["symptom"], "getSymptomDefinitions").and.returnValue(of(definitions));
    component["loadDefinitions"].subscribe(defs => {
      expect(defs.length).toEqual(1);
      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  it("loadSymptomGroups", fakeAsync(() => {
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();

    component["loadSymptomGroups"]();
    tick();
    expect(dispatchSpy).toHaveBeenCalled();
  }));

  it("loadLaborders", fakeAsync(() => {
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();

    component["loadLaborders"]();
    tick();
    expect(dispatchSpy).toHaveBeenCalled();
  }));

});
