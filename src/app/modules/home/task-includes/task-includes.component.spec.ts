/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { Component, Input, SimpleChange } from "@angular/core";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgRedux } from "@angular-redux/store";
import { Router } from "@angular/router";
import * as _ from "lodash";

import { TaskIncludesComponent } from "./task-includes.component";
import { TitleCasePipe } from "../../pipes/title-case.pipe";
import { IconComponent } from "../../validation/icon/icon.component";
import { defaultState } from "app/app.config";
import { RouterTestingModule } from "@angular/router/testing";
import { ModalComponent } from "../../gui-widgets/components/modal/modal.component";
import { SymptomService, EcwService, SourceService } from "app/services";
import * as userSelectors from "app/state/user/user.selectors";
import * as workbenchSelectors from "app/state/workbench/workbench.selectors";
import * as symptomsSelectors from "app/state/symptoms/symptoms.selectors";
import * as workbenchActions from "app/state/workbench/workbench.actions";
import * as denormalizedModel from "app/state/denormalized.model";
import { EcwServiceStub } from "../../../../test/services-stubs/ecw.service.stub";
import { of } from "rxjs/observable/of";
import { SourceServiceStub } from "test/services-stubs/source.service.stub";
import FormValue = Illness.FormValue;
import { HomeService } from "../home.service";
import { HomeServiceStub } from "../../../../test/services-stubs/home.service.stub";
import { ValidationService } from "../../validation/validation.service";
import { ValidationServiceStub } from "../../../../test/services-stubs/validation.service.stub";
import { SymptomServiceStub } from "../../../../test/services-stubs/symtom.service.stub";

const fakeTasks = require("../../../../test/data/tasks.json").tasks;
const fakeIllnesses = require("../../../../test/data/illnesses.json");
const fakeIllnessData = require("../../../../test/data/illness-data.json");
const fakeUsers = require("../../../../test/data/users.json");
const fakeIllnessFormValue: Illness.FormValue = fakeIllnesses[0].form;
const illStatesNames = defaultState.global.illStates;
const user = fakeUsers[0];
const state = { ..._.cloneDeep(defaultState), user: user };

const mockRedux = {
  getState: (): State.Root => {
    return state
  },
  select: (selector) => of(selector(state)),
  dispatch: (arg: any) => {}
};


@Component({
  selector: "mica-copy-illness",
  template: "<div></div>"
})
class MockCopyIllnessComponent {
  @Input() illness: Illness.Data;
}

describe("TaskIncludesComponent", () => {
  let component: TaskIncludesComponent;
  let fixture: ComponentFixture<TaskIncludesComponent>;
  let router: Router;
  let redux: NgRedux<State.Root>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TaskIncludesComponent,
        TitleCasePipe,
        IconComponent,
        MockCopyIllnessComponent,
        ModalComponent
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        { provide: EcwService, useClass: EcwServiceStub},
        { provide: HomeService, useClass: HomeServiceStub},
        { provide: SourceService, useClass: SourceServiceStub},
        { provide: ValidationService, useClass: ValidationServiceStub },
        { provide: SymptomService, useClass: SymptomServiceStub}
      ],
      imports: [
        NgbModule,
        RouterTestingModule
      ]
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ModalComponent]
      }
    }).compileComponents();
  }));

  beforeEach(() => {
    redux = TestBed.get(NgRedux);
    router = TestBed.get(Router);
    fixture = TestBed.createComponent(TaskIncludesComponent);
    component = fixture.componentInstance;
    (component as any).task = fakeTasks[0];
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("goToEdit", () => {
    const mockNavigate = spyOn(router, "navigate").and.callFake(() => {});
    component.isReviewer = true;
    (component as any).goToEdit();
    expect(mockNavigate).toHaveBeenCalledWith(["review"]);

    component.isReviewer = false;
    (component as any).goToEdit();
    expect(mockNavigate).toHaveBeenCalledWith(["workbench", "general"]);
  });

  it("getter nonWorkableIllnesses", () => {
    component.syncedIllnesses = null;
    expect((component as any).nonWorkableIllnesses).toEqual([]);

    // if user is reviewer
    component.isReviewer = true;
    component.syncedIllnesses = {};
    (component.syncedIllnesses as any)[illStatesNames.approved] = [fakeIllnessFormValue];
    expect((component as any).nonWorkableIllnesses).toEqual([fakeIllnessFormValue]);
    // * * *

    // if user is not reviewer
    component.isReviewer = false;
    component.syncedIllnesses = {};
    (component.syncedIllnesses as any)[illStatesNames.complete] = [fakeIllnessFormValue];
    expect((component as any).nonWorkableIllnesses).toEqual([fakeIllnessFormValue]);

    component.syncedIllnesses = {};
    expect((component as any).nonWorkableIllnesses).toEqual([]);
    // * * *
  });

  it("getter workableIllnesses", () => {
    component.syncedIllnesses = null;
    expect((component as any).workableIllnesses).toEqual([]);

    // if user is not reviewer
    component.isReviewer = false;
    component.syncedIllnesses = {};
    (component.syncedIllnesses as any)[illStatesNames.pending] = [fakeIllnessFormValue];
    expect((component as any).workableIllnesses).toEqual([fakeIllnessFormValue]);
    // * * *

    // if user is reviewer
    component.isReviewer = true;
    component.syncedIllnesses = {};
    (component.syncedIllnesses as any)[illStatesNames.readyForReview] = [fakeIllnessFormValue];
    expect((component as any).workableIllnesses).toEqual([fakeIllnessFormValue]);

    delete (component.syncedIllnesses as any)[illStatesNames.readyForReview];
    expect((component as any).workableIllnesses).toEqual([]);
    // * * *
  });

  it("getter allIllnessesComplete", () => {
    expect(component.allIllnessesComplete).toBeFalsy();
  });

  it("isActiveIllness", () => {
    component.currentCode = "code";
    component.currentVersion = 1;
    expect(component["isActiveIllness"](component.currentCode, component.currentVersion)).toBeTruthy();
  });

  it("isActiveIllness", () => {
    spyOn(workbenchSelectors, "illnessValue").and.returnValue(() => "string");
    expect(component["hasData"]("code", 1)).toBeTruthy();
  });

  xit("method onEdit", () => {
    const illness: Illness.Normalized.IllnessValue = fakeIllnesses[0];
    const mockGoToEdit = spyOn((component as any), "goToEdit").and.callFake(() => {});
    const mockIsReviewer = spyOn(userSelectors, "isReviewer").and.returnValue(true);
    (component as any).syncedIllnesses = {};

    expect(() =>
      (component as any).onEdit(illness.form.idIcd10Code, illness.form.name, false)
    ).toThrow(jasmine.any(Error));

    (component as any).syncedIllnesses[illStatesNames.readyForReview] = [illness.form];
    (component as any).onEdit(illness.form.idIcd10Code, illness.form.name, false);
    expect(mockGoToEdit).toHaveBeenCalled();
  });

  xit("ngOnChanges", () => {
    const illness = fakeIllnesses[0];
    const oldValue = _.cloneDeep(illness.form);
    const newValue = {..._.cloneDeep(illness.form), name: "new name"};
    const changes = {syncedIllnesses: new SimpleChange(component.syncedIllnesses, newValue, true)};
    let result;
    component.reviewerIllnessMissing.subscribe(res => result = res);
    component.task.illness = [oldValue];

    component.ngOnChanges(changes);
    expect(result).toEqual([oldValue]);
    result = null;

    (component as any).syncedIllnesses = {};
    (oldValue as any).state = state.global.illStates.readyForReview;
    (component.syncedIllnesses as any)[state.global.illStates.readyForReview] = [oldValue];
    component.ngOnChanges(changes);
    expect(result).toBeNull();

    changes.syncedIllnesses.currentValue = undefined;
    component.ngOnChanges(changes);
    expect(result).toBeNull();
  });

  it("onSkipIllness", fakeAsync(() => {
    const illness = _.cloneDeep(fakeIllnessData);
    const spyOpenModal = spyOn(component["modalService"] as any, "open").and.callThrough();
    const event = new Event("custom");
    let result;

    component.skipIllness.subscribe(res => {
      result = res
    });
    component["onSkipIllness"](illness, event);

    const modal = spyOpenModal.calls.mostRecent().returnValue;
    expect(modal.componentInstance.data.actionName).toEqual("skip");

    modal.close(true);
    tick();
    expect(result).toEqual([illness, event]);
  }));

  it("onRevertData", fakeAsync(() => {
    const illnessForm = _.cloneDeep(fakeIllnesses[0]).form;
    const spyOpenModal = spyOn(component["modalService"] as any, "open").and.callThrough();
    const spyUpsertIllness = spyOn(workbenchActions, "upsertIllness").and.callThrough();
    const spyNormalizeIllness = spyOn(denormalizedModel, "normalizeIllness").and.callThrough();
    const spyIllnessValue = spyOn(workbenchSelectors, "illnessValue").and.callThrough();
    const event = new Event("custom");
    let result;
    let modal;

    component["onRevertData"](illnessForm.idIcd10Code, illnessForm.version);
    modal = spyOpenModal.calls.mostRecent().returnValue;
    modal.result.then(res => result = res);
    expect(modal.componentInstance.data.actionName).toEqual("revert");

    modal.close(true);
    tick();
    expect(result).toBeTruthy();

    component.syncedIllnesses = {};
    (component.syncedIllnesses as any)[state.global.illStates.readyForReview] = [illnessForm];
    component["onRevertData"](illnessForm.idIcd10Code, illnessForm.version);
    modal = spyOpenModal.calls.mostRecent().returnValue;
    modal.close(true);
    tick();
    expect(spyUpsertIllness).toHaveBeenCalledWith(illnessForm);
  }));

  it("ngOnInit", fakeAsync(() => {
    const code = "17";
    const version = 1;
    spyOnProperty(component, "activeIllnessValue", "get").and.returnValue(of({form: {idIcd10Code: code, version: version}}));
    component.ngOnInit();
    tick();
    expect(component.currentCode).toEqual(code);
    expect(component.currentVersion).toEqual(version);
  }));

  it("ngOnInit", fakeAsync(() => {
    spyOnProperty(component, "activeIllnessValue", "get").and.returnValue(of(null));
    component.ngOnInit();
    tick();
    expect(component.currentCode).toEqual("");
    expect(component.currentVersion).toEqual(1);
  }));

  it("getSymptomGroups", () => {
    const formValue = {
      symptomGroups: [
        {
          categories: []
        }
      ]
    };
    expect(component["getSymptomGroups"](formValue as FormValue)).toEqual([]);
  });

  it("dispatchPostMsg", () => {
    spyOn(denormalizedModel, "normalizeIllness").and.returnValue(null);
    spyOn(workbenchSelectors, "illnessValue").and.returnValue(() => null);
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();
    component["dispatchPostMsg"]({} as any, "A", 1);
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it("allIllnessesComplete", () => {
    spyOnProperty<any>(component, "nonWorkableIllnesses", "get").and.returnValue([]);
    spyOnProperty(component, "chapters", "get").and.returnValue([]);
    expect(component.allIllnessesComplete).toBeTruthy();
  });

  it("handleUpsertObservable", () => {
    const observer = {
      next: () => {},
      error: () => {},
      complete: () => {}
    };
    const nextSpy = spyOn(observer, "next").and.callThrough();

    spyOn(userSelectors, "isReviewer").and.returnValue(true);
    spyOn(workbenchSelectors, "illnessValue").and.returnValue(() => false);
    spyOnProperty<any>(component, "workableIllnesses", "get").and.returnValue([]);
    component["handleUpsertObservable"]("A", 1, observer);
    expect(nextSpy).toHaveBeenCalled();
  });

  it("handleUpsertObservable", () => {
    const observer = {
      next: () => {},
      error: () => {},
      complete: () => {}
    };
    const errorSpy = spyOn(observer, "error").and.callThrough();

    spyOn(redux, "dispatch").and.throwError("error");
    spyOn(userSelectors, "isReviewer").and.returnValue(true);
    spyOn(workbenchSelectors, "illnessValue").and.returnValue(() => false);
    spyOnProperty<any>(component, "workableIllnesses", "get").and.returnValue([]);
    component["handleUpsertObservable"]("A", 1, observer);
    expect(errorSpy).toHaveBeenCalled();
  });

  it("handleUpsertObservable", () => {
    const observer = {
      next: () => {},
      error: () => {},
      complete: () => {}
    };
    const nextSpy = spyOn(observer, "next").and.callThrough();

    spyOn(userSelectors, "isReviewer").and.returnValue(false);
    component["handleUpsertObservable"]("A", 1, observer);
    expect(nextSpy).toHaveBeenCalled();
  });

  it("setActiveIllness", () => {
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();

    component.isReviewer = false;
    spyOn(workbenchSelectors, "activeIllnessValue").and.returnValue({});
    component["setActiveIllness"]("name", "A", 1, [, {}]);
    expect(dispatchSpy).toHaveBeenCalledTimes(2);
  });

  it("getNlpIllness", () => {
    const data = [{}];
    expect(component["getNlpIllness"](data)).toEqual({});
  });

  it("getNlpIllness", () => {
    const data = [];
    expect(component["getNlpIllness"](data)).toEqual(null);
  });

  it("removeNotExistingNlpSymptoms", () => {
    const entities = {
      symptoms: {
        symptomId: {}
      }
    };
    const nlpIllness = {
      symptomGroups: [
        {
          categories: [
            {
              symptoms: [
                {
                  symptomID: "symptomId"
                }
              ]
            }
          ]
        },
        {
          categories: null
        }
      ]
    };
    const activeIllness = {
      entities: {
        symptoms: {
          symptomId: {}
        }
      },
      form: {
        groupsComplete: [
          "completedGroup"
        ]
      }
    };

    spyOn(symptomsSelectors, "entities").and.returnValue(entities);
    component["removeNotExistingNlpSymptoms"](nlpIllness as any, activeIllness as any);
  })

});
