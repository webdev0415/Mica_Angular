/* tslint:disable:no-unused-variable */
import { async, fakeAsync, ComponentFixture, TestBed, tick } from "@angular/core/testing";
import * as _ from "lodash";
import { ChangeDetectorRef } from "@angular/core";
import { UserComponent } from "./user.component";
import { InlineSpinnerComponent } from "../../../spinner/inline-spinner/inline-spinner.component";
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgRedux, NgReduxModule } from "@angular-redux/store";
import { MockNgRedux, NgReduxTestingModule } from "@angular-redux/store/testing";
import { defaultState } from "../../../../app.config";
import { IllnessService, AuthService } from "../../../../services";
import { IllnessServiceStub } from "../../../../../test/services-stubs/illness.service.stub";
import { AuthServiceStub } from "../../../../../test/services-stubs/auth.service.stub";
import { RouterTestingModule } from "@angular/router/testing";
import { testRoutes } from "../../../../../test/data/test-routes";
import { TestComponent } from "../../../../../test/test.component";
import * as workbenchSelectors from "../../../../state/workbench/workbench.selectors";
import { of } from "rxjs/observable/of";
import { MatIconModule, MatMenuModule } from "@angular/material";

const fakeUsers = require("../../../../../test/data/users.json");
const userData = fakeUsers[0];
const state = _.cloneDeep(defaultState);

describe("UserComponent", () => {
  const mockRedux = {
    getState: (): State.Root => state,
    dispatch: (arg: any) => {
    }
  };
  let component: UserComponent;
  let testComponent: TestComponent;
  let fixture: ComponentFixture<UserComponent>;
  let modalService: NgbModal;
  let illnessService: IllnessServiceStub;
  let auth: AuthService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        UserComponent,
        InlineSpinnerComponent,
        TestComponent
      ],
      providers: [
        { provide: IllnessService, useClass: IllnessServiceStub },
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: NgRedux, useValue: mockRedux },
        { provide: NgReduxModule, useClass: NgReduxTestingModule },
        ChangeDetectorRef
      ],
      imports: [
        NgbModule,
        RouterTestingModule.withRoutes(testRoutes),
        MatMenuModule,
        MatIconModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    testComponent = TestBed.createComponent(TestComponent).componentInstance;
    fixture.detectChanges();
    modalService = TestBed.get(NgbModal);
    illnessService = TestBed.get(IllnessService);
    auth = TestBed.get(AuthService);
    (state as any).user = userData;
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("state getter should return actual state", () => {
    expect(component["state"]).toEqual(state);
  });

  it("should monitor user state", () => {
    MockNgRedux.getSelectorStub(["user"]).next(userData);
    expect(component.user).toEqual(userData);
  });

  it("should log out when modal is being dismissed with reason \"log-out\"", fakeAsync(() => {
    const mockNavigate = spyOn(component["router"], "navigate").and.callFake((route: string[]) => {
    });
    spyOn(workbenchSelectors, "activeIllnessValueDenorm").and.returnValue(false);
    component.onLogOut(testComponent.templateRef);
    component["modalRef"].dismiss("log-out");
    tick();
    expect(mockNavigate).toHaveBeenCalled();
  }));

  it("should not log out when the reason of modal closing don't equal to \"log-out\"", fakeAsync(() => {
    const mockNavigate = spyOn(component["router"], "navigate").and.callFake((route: string[]) => {
    });
    spyOn(workbenchSelectors, "activeIllnessValueDenorm").and.returnValue(false);
    component.onLogOut(testComponent.templateRef);
    component["modalRef"].dismiss(null);
    tick();
    expect(mockNavigate).not.toHaveBeenCalled();
  }));

  it("should log out with sync", () => {
    component["modalRef"] = modalService.open(testComponent.templateRef);
    const mockCloseModal = spyOn(component["modalRef"], "close").and.callThrough();
    const mockActiveIllness = spyOn(workbenchSelectors, "activeIllnessValueDenorm");
    mockActiveIllness.and.returnValue(false);
    expect(component.logOutWithSync()).toBeFalsy();

    mockActiveIllness.and.returnValue(true);
    spyOn(component["router"], "navigate").and.callFake((route: string[]) => {
    });
    component.logOutWithSync();
    expect(mockCloseModal).toHaveBeenCalled();

    component["modalRef"] = null;
    expect(component.logOutWithSync()).toBeFalsy();
  });

  it("logOutWithSync", () => {
    spyOnProperty<any>(auth, "isAuthenticated$", "get").and.returnValue(of(false));
    expect(component.logOutWithSync()).toBeUndefined();
  });

  it("syncBtnClass", () => {
    component.syncing = true;
    expect(component.syncBtnClass).toEqual("btn-default");
  });

  it("onSyncData01", () => {
    spyOnProperty<any>(auth, "isAuthenticated$", "get").and.returnValue(of(false));
    expect(component.onSyncData()).toBeUndefined();
  });

  it("onSyncData02", () => {
    const mockActiveIllness = spyOn(workbenchSelectors, "activeIllnessValueDenorm");
    mockActiveIllness.and.returnValue(false);
    component.onSyncData();
    expect(component.syncing).toBeTruthy();
  });

  it("onSyncData03", () => {
    const mockActiveIllness = spyOn(workbenchSelectors, "activeIllnessValueDenorm");
    mockActiveIllness.and.returnValue(true);
    component.onSyncData();
    expect(component.syncing).toBeFalsy();
  });

});
