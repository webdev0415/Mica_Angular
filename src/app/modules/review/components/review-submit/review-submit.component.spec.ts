import { ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import * as _ from "lodash";

import { ReviewSubmitComponent } from "./review-submit.component";
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SyncingBtnComponent } from "../syncing-btn/syncing-btn.component";
import { CriticalityComponent } from "../../../gui-widgets/criticality/criticality.component";
import { InlineSpinnerComponent } from "../../../spinner/inline-spinner/inline-spinner.component";
import { NgRedux } from "@angular-redux/store";
import { defaultState, globalStateInit } from "app/app.config";
import { IllnessService } from "app/services/illness.service";
import { IllnessServiceStub } from "../../../../../test/services-stubs/illness.service.stub";
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { Router } from "@angular/router";
import { ValidationService } from "../../../validation/validation.service";
import { ValidationServiceStub } from "../../../../../test/services-stubs/validation.service.stub";
import * as workbenchActions from "app/state/workbench/workbench.actions";
import * as messagesActions from "app/state/messages/messages.actions";
import * as workbenchSelectors from "app/state/workbench/workbench.selectors";
import * as denormalizedModel from "app/state/denormalized.model";
import * as createFormUtil from "app/util/forms/create";
import { TestComponent } from "../../../../../test/test.component";
import FormValue = Illness.FormValue;
import State = Illness.State;
import { UniquenessService } from "../../services/uniqueness.service";
import { UniquenessServiceStub } from "../../../../../test/services-stubs/uniqueness.service.stub";
import IllnessValue = Illness.Normalized.IllnessValue;
import { of } from "rxjs/observable/of";
import { throwError } from "rxjs";

const fakeIllnesses = require("../../../../../test/data/illnesses.json");
const fakeErrors = require("../../../../../test/data/errors.json");
let state: State.Root;

const mockRedux = {
  getState: (): State.Root => {
    return state;
  },
  select: (selector: any) => of(selector(defaultState)),
  dispatch: (arg: any) => {
  }
};

const mockRouter = {
  navigate: jasmine.createSpy("navigate")
};

describe("ReviewSubmitComponent", () => {
  let component: ReviewSubmitComponent;
  let fixture: ComponentFixture<ReviewSubmitComponent>;
  let validationService: ValidationServiceStub;
  let redux: NgRedux<State.Root>;
  let illnessService: IllnessServiceStub;
  let uniqueService: UniquenessServiceStub;
  let modalService: NgbModal;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        ReviewSubmitComponent,
        SyncingBtnComponent,
        CriticalityComponent,
        InlineSpinnerComponent
      ],
      providers: [
        { provide: IllnessService, useClass: IllnessServiceStub },
        { provide: ValidationService, useClass: ValidationServiceStub },
        { provide: UniquenessService, useClass: UniquenessServiceStub },
        { provide: NgRedux, useValue: mockRedux },
        { provide: Router, useValue: mockRouter },
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        NgbModule
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    state = _.cloneDeep(defaultState);
    redux = TestBed.get(NgRedux);
    illnessService = TestBed.get(IllnessService);
    validationService = TestBed.get(ValidationService);
    uniqueService = TestBed.get(UniquenessService);
    modalService = TestBed.get(NgbModal);
    fixture = TestBed.createComponent(ReviewSubmitComponent);
    component = fixture.componentInstance;
    component.illForm = new FormGroup({
      form: new FormGroup({}),
      value: new FormControl("")
    });
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
    component.ngOnDestroy();
  });

  it("onAboutToReject", () => {
    const rejectionReasonName = component["rejectionReasonCtrlName"];
    const form: AbstractControl = component["illForm"].get("form");

    component.onAboutToReject();
    expect(form.get(rejectionReasonName)).toBeTruthy();

    component.onAboutToReject();
    expect(form.get(rejectionReasonName)).toBeFalsy();

    component["subs"].forEach(s => s.unsubscribe());
    component["illForm"].removeControl("form");
    expect(() => component.onAboutToReject()).toThrow(jasmine.any(Error));
  });

  it("onSubmitIllness", () => {
    const fakeIllness: Illness.Normalized.IllnessValue = fakeIllnesses[0];
    const mockSyncIllData = spyOn(<any>component, "syncIllData").and.callFake(() => {});
    let newIllValue;

    spyOn(validationService, "sanitizeIllness").and.returnValue(fakeIllness);

    component.syncingIllness = false;
    component.onSubmitIllness(globalStateInit.illStates.pending);
    newIllValue = mockSyncIllData.calls.mostRecent().args[0];
    expect(newIllValue.criticality).toEqual(fakeIllness.form.criticality);
    expect(component.syncingIllness).toEqual(true);

    component.syncingIllness = false;
    component.onSubmitIllness(globalStateInit.illStates.pending, 3);
    newIllValue = mockSyncIllData.calls.mostRecent().args[0];
    expect(newIllValue.criticality).toEqual(3);
    expect(component.syncingIllness).toEqual(true);

    const form = component.illForm.get("form") as FormGroup;
    const rejectionReason = "reason";
    form.addControl(component["rejectionReasonCtrlName"], new FormControl(rejectionReason));
    component.onSubmitIllness(globalStateInit.illStates.pending);
    newIllValue = mockSyncIllData.calls.mostRecent().args[0];
    expect(newIllValue.rejectionReason).toEqual(rejectionReason);
  });

  it("onSubmitCriticality", fakeAsync(() => {
    const testFixture = TestBed.createComponent(TestComponent);
    const testTemplateRef = testFixture.componentRef.instance.templateRef;
    const mockOpenModal = spyOn(modalService, "open").and.callThrough();
    const mockOnSubmitIllness = spyOn(component, "onSubmitIllness").and.callFake(() => {});
    const mockConsoleError = spyOn(console, "error").and.callThrough();
    const result = "result";
    let dismissReason = "cancel";
    let modal;

    component.onSubmitCriticality(testTemplateRef);
    modal = mockOpenModal.calls.mostRecent().returnValue;
    modal.dismiss(dismissReason);
    tick();
    expect(mockConsoleError).not.toHaveBeenCalled();

    dismissReason = "other reason";
    component.onSubmitCriticality(testTemplateRef);
    modal = mockOpenModal.calls.mostRecent().returnValue;
    modal.dismiss(dismissReason);
    tick();
    expect(mockConsoleError.calls.mostRecent().args[1]).toContain(dismissReason);

    component.onSubmitCriticality(testTemplateRef);
    modal = mockOpenModal.calls.mostRecent().returnValue;
    modal.close(result);
    tick();
    expect(mockOnSubmitIllness).not.toHaveBeenCalled();

    component.onSubmitCriticality(testTemplateRef);
    modal = mockOpenModal.calls.mostRecent().returnValue;
    modal.close(result);
    expect(mockOnSubmitIllness).not.toHaveBeenCalled();

    component.criticalityCtrl = new FormControl("value");
    component.onSubmitCriticality(testTemplateRef);
    modal = mockOpenModal.calls.mostRecent().returnValue;
    modal.close(result);
    tick();
    expect(mockOnSubmitIllness).toHaveBeenCalled();
  }));

  it("onAboutToReject", () => {
    component.illForm = null;
    expect(() => component.onAboutToReject()).toThrow();
  });

  it("syncIllData", fakeAsync(() => {
    const fakeError = fakeErrors.basicError;
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    const mockPostMsg = spyOn(messagesActions, "postMsg").and.returnValue("postMessage");
    const syncIllDataServiceSpy = spyOn(illnessService, "syncIllnessData");

    spyOn(workbenchActions, "deleteIllness").and.returnValue("deleteIllness");

    syncIllDataServiceSpy.and.returnValue(of({ icd10CodesStatus: 1 }));
    component["syncIllData"]({} as FormValue);
    tick();
    expect(mockDispatch).toHaveBeenCalledWith("deleteIllness");

    syncIllDataServiceSpy.and.returnValue(throwError(fakeError));
    expect(() => {
      component["syncIllData"]({} as FormValue);
      tick();
    }).toThrow();
    expect(mockDispatch).toHaveBeenCalledWith("postMessage");
    expect(mockPostMsg.calls.mostRecent().args[0]).toContain(fakeError.message);
  }));

  it("handleModal", () => {
    const res = {
      _embedded: {
        uniquenessCheck: {
          undifferentiableIllnesses: [
            {
              id: 1
            }
          ]
        }
      }
    };
    const modalRef = {
      componentInstance: {}
    };

    spyOn(workbenchSelectors, "activeIllnessValue").and.returnValue({});
    component.illForm = new FormGroup({
      idIcd10Code: new FormControl(""),
      name: new FormControl("")
    });
    expect(component["handleModal"](res, modalRef)).toBeUndefined();
  });

  it("handleModal", () => {
    const res = {
      _embedded: {
        uniquenessCheck: {
          undifferentiableIllnesses: [
            {
              id: 1
            }
          ]
        }
      }
    };
    const modalRef = {
      componentInstance: {}
    };

    spyOn(workbenchSelectors, "activeIllnessValue").and.returnValue({});
    component.illForm = new FormGroup({});
    expect(component["handleModal"](res, modalRef)).toBeUndefined();
  });

  it("handleModal", () => {
    const illForm = new FormGroup({
      form: new FormGroup({
        idIcd10Code: new FormControl(""),
        name: new FormControl("")
      })
    });
    const modalRef = {
      componentInstance: {}
    };

    component.illForm = illForm;
    component["handleModal"]([], modalRef);
    expect((modalRef as any).componentInstance.name).toEqual("");
  });

  it("ngOnDestroy", () => {
    const formSub = of({}).subscribe();
    const unsubSpy = spyOn(formSub, "unsubscribe").and.callThrough();

    component.formSub = formSub;
    component.ngOnDestroy();
    expect(unsubSpy).toHaveBeenCalled();
  });

  it("updateAndValidityIllnessForm", () => {
    spyOn(workbenchSelectors, "activeIllnessValue").and.returnValue(null);
    expect(component.updateAndValidityIllnessForm()).toBeUndefined();
  });

  it("updateAndValidityIllnessForm", () => {
    const form = new FormGroup({
      form: new FormGroup({
        rejectionReason: new FormControl("")
      })
    });
    const formSub = of({}).subscribe();
    const unsubSpy = spyOn(formSub, "unsubscribe").and.callThrough();

    spyOn(workbenchSelectors, "activeIllnessValue").and.returnValue({});
    spyOn(createFormUtil, "formGroupFactory").and.returnValue(form);
    component.formSub = formSub;
    component.updateAndValidityIllnessForm();
    expect(unsubSpy).toHaveBeenCalled();
  });

  it("updateAndValidityIllnessForm", () => {
    const form = new FormGroup({
      form: new FormGroup({
        "reason": new FormControl("")
      })
    });
    const updateValueAndValiditySpy = spyOn(form, "updateValueAndValidity").and.callThrough();

    spyOn(workbenchSelectors, "activeIllnessValue").and.returnValue({});
    spyOn(createFormUtil, "formGroupFactory").and.returnValue(form);
    component.formSub = null;
    component.updateAndValidityIllnessForm();
    expect(updateValueAndValiditySpy).toHaveBeenCalled();
  });

  it("checkIllForm", () => {
    const form = new FormGroup({
      subForm: new FormGroup({
        "reason": new FormControl("")
      })
    });

    component.illForm = form;
    expect(() => component["checkIllForm"]()).toThrow();
  });

  it("ngOnInit", () => {
    const updateAndValidityIllnessFormSpy = spyOn(component, "updateAndValidityIllnessForm").and.callFake(() => {});

    spyOnProperty(component, "symptomGroupsCompleteValue", "get").and.returnValue(of([]));
    spyOn<any>(component, "onCheckUniqueness").and.callFake(() => {});
    component.ngOnInit();
    expect(updateAndValidityIllnessFormSpy).toHaveBeenCalled();
  });

  it("onCheckUniqueness", () => {
    spyOn(workbenchSelectors, "activeIllnessValue").and.returnValue(null);
    spyOn(uniqueService, "checkUniqueness").and.returnValue(of([]));
    expect(component["onCheckUniqueness"]()).toBeUndefined();
  });

  it("onCheckUniqueness", () => {
    const handleModalSpy = spyOn<any>(component, "handleModal").and.callFake(() => {});
    const openModalSpy = spyOn<any>(modalService, "open").and.callFake(() => {});

    spyOn<any>(component, "checkUniqueness").and.returnValue(of([]));
    component["onCheckUniqueness"]();
    expect(component.isUnique).toBeTruthy();
    expect(openModalSpy).toHaveBeenCalled();
    expect(handleModalSpy).toHaveBeenCalled();
  });

  it("onCheckUniqueness", () => {
    const handleModalSpy = spyOn<any>(component, "handleModal").and.callFake(() => {});

    spyOn(workbenchSelectors, "activeIllnessValue").and.returnValue({ form: { version: 1, idIcd10Code: "code" } });
    spyOn(modalService, "open").and.returnValue(null);
    spyOn<any>(component, "checkUniqueness").and.returnValue(of(null));
    component.isUnique = false;
    component.initial = false;
    component["onCheckUniqueness"]();
    expect(component.isUnique).toBeFalsy();
    expect(handleModalSpy).toHaveBeenCalled();
  });

  it("onCheckUniqueness", fakeAsync(() => {
    spyOn(workbenchSelectors, "activeIllnessValue").and.returnValue({ form: { version: 1, idIcd10Code: "code" } });
    spyOn<any>(component, "checkUniqueness").and.returnValue(throwError(new Error("")));
    expect(() => {
      component["onCheckUniqueness"]();
      tick();
    }).toThrow();
    expect(component.syncingIllness).toBeFalsy();
  }));

  it("checkUniqueness", () => {
    const illnessValue = {
      form: {
        idIcd10Code: "code",
        version: 1
      }
    } as IllnessValue;
    const includeTime = true;
    const checkUniquenessSpy = spyOn(uniqueService, "checkUniqueness").and.returnValue(of({}));
    const syncIllnessDataSpy = spyOn(illnessService, "syncIllnessData").and.returnValue(of({}));

    spyOn(denormalizedModel, "denormalizeIllnessValue").and.returnValue({});
    component["checkUniqueness"](illnessValue, includeTime).subscribe(res => res);
    expect(syncIllnessDataSpy).toHaveBeenCalled();
    expect(checkUniquenessSpy).toHaveBeenCalled();
  });
});
