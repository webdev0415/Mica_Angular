import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { WorkbenchMainComponent } from "./main.component";
import { testRoutes } from "../../../../../test/data/test-routes";
import { RouterTestingModule } from "@angular/router/testing";
import { TestComponent } from "../../../../../test/test.component";
import { IllnessErrorCounterComponent } from "../../../error-reporting/illness-error-counter/illness-error-counter.component";
import { IllnessValueComponent } from "../../../error-reporting/illness-value/illness-value.component";
import { FormControl, FormGroup, FormsModule } from "@angular/forms";
import { Component } from "@angular/core";
import { NgRedux, NgReduxModule } from "@angular-redux/store";
import { NgReduxTestingModule } from "@angular-redux/store/testing";
import { navInit } from "app/app.config";
import { TitleService } from "../../../global-providers/services/title.service";
import { PageScrollService } from "ngx-page-scroll";
import { SymptomService } from "app/services";
import { PageScrollServiceStub } from "../../../../../test/services-stubs/page-scroll.service.stub";
import { SymptomServiceStub } from "../../../../../test/services-stubs/symtom.service.stub";
import { TitleServiceStub } from "../../../../../test/services-stubs/title.service.stub";
import { TOGGLE_ILLNESS_ERRORS } from "app/state/nav/nav.actions";
import { of } from "rxjs/observable/of";
import * as symptomsSelectors from "app/state/symptoms/symptoms.selectors";
import { symptomDataPath } from "app/state/symptoms/symptoms.selectors";
import { NavigationEnd } from "@angular/router";
import * as navSelectors from "app/state/nav/nav.selectors";
import * as createFormUtils from "app/util/forms/create";
import * as illnessValidators from "app/util/forms/validators";
import IllnessValue = Illness.Normalized.IllnessValue;
import { ValidationServiceStub } from "../../../../../test/services-stubs/validation.service.stub";
import { ValidationService } from "../../../validation/validation.service";
import * as denormalizedModel from "app/state/denormalized.model";

const fakeUsers = require("../../../../../test/data/users.json");

@Component({
  selector: "workbench-submit-group",
  template: "<div></div>"
})
class MockSubmitGroupComponent {}

@Component({
  selector: "workbench-debug-box",
  template: "<div></div>"
})
class MockDebugBoxComponent {}

@Component({
  selector: "mica-symptom-search",
  template: "<div></div>"
})
class MockSymptomSearchComponent {}

const mockRedux = {
  getState: () => {
    return {
      user: fakeUsers[0],
      nav: navInit
    }
  },
  dispatch: (arg: any) => {}
};

describe("WorkbenchMainComponent", () => {
  let component: WorkbenchMainComponent;
  let fixture: ComponentFixture<WorkbenchMainComponent>;
  let redux: NgRedux<State.Root>;
  let pageScrollService: PageScrollService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        WorkbenchMainComponent,
        TestComponent,
        IllnessErrorCounterComponent,
        IllnessValueComponent,
        MockSubmitGroupComponent,
        MockDebugBoxComponent,
        MockSymptomSearchComponent,
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        { provide: NgReduxModule, useClass: NgReduxTestingModule },
        { provide: TitleService, useClass: TitleServiceStub },
        { provide: PageScrollService, useClass: PageScrollServiceStub },
        { provide: SymptomService, useClass: SymptomServiceStub },
        { provide: ValidationService, useClass: ValidationServiceStub },
      ],
      imports: [
        FormsModule,
        RouterTestingModule.withRoutes(testRoutes)
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkbenchMainComponent);
    redux = TestBed.get(NgRedux);
    pageScrollService = TestBed.get(PageScrollService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("toggleErrors", () => {
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    component.toggleErrors();
    expect(mockDispatch).toHaveBeenCalledWith({type: TOGGLE_ILLNESS_ERRORS});
  });

  it("ngOnDestroy", () => {
    component["illRootFormSub"] = of("").subscribe();
    component["illnessErrorsAreShowing"] = true;
    const toggleErrorsSpy = spyOn(component, "toggleErrors").and.callThrough();
    const illRootFormSubSpy = spyOn(component["illRootFormSub"], "unsubscribe").and.callThrough();
    component.ngOnDestroy();
    expect(toggleErrorsSpy).toHaveBeenCalled();
    expect(illRootFormSubSpy).toHaveBeenCalled();
  });

  it("getState", () => {
    const mockGetState = spyOn(redux, "getState").and.callThrough();
    const res = component["state"];
    expect(mockGetState).toHaveBeenCalled();
  });

  it("processNavigationEnd", () => {
    const loc = {
      categoryID: "17",
      sectionID: "17"
    };
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();

    spyOnProperty<any>(component, "queryParams", "get").and.returnValue({
      symptomID: "17"
    });
    spyOn(symptomsSelectors, "symptomDataPath").and.returnValue(() => loc);
    component["processNavigationEnd"]();
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("processNavigationEnd", () => {
    const loc = {
      categoryID: "17",
      sectionID: "17"
    };
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();

    spyOnProperty<any>(component, "queryParams", "get").and.returnValue({
      symptomID: "17"
    });
    spyOn(navSelectors, "activeCategoryID").and.returnValue(loc.categoryID);
    spyOn(navSelectors, "activeSectionID").and.returnValue(loc.sectionID);
    spyOn(symptomsSelectors, "symptomDataPath").and.returnValue(() => loc);
    component["processNavigationEnd"]();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("processNavigationEnd", () => {
    const loc = {
      categoryID: "17",
      sectionID: null
    };
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();

    spyOnProperty<any>(component, "queryParams", "get").and.returnValue({
      symptomID: "17"
    });
    spyOn(navSelectors, "activeCategoryID").and.returnValue(loc.categoryID);
    spyOn(navSelectors, "activeSectionID").and.returnValue("17");
    spyOn(symptomsSelectors, "symptomDataPath").and.returnValue(() => loc);
    component["processNavigationEnd"]();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("processNavigationEnd", () => {
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();

    spyOnProperty<any>(component, "queryParams", "get").and.returnValue({
      symptomID: null
    });
    component["processNavigationEnd"]();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("onNavigationEnd", () => {
    spyOnProperty<any>(component, "queryParams", "get").and.returnValue({});
    const startSpy = spyOn(pageScrollService, "start").and.callThrough();
    component["onNavigationEnd"]();
    expect(startSpy).toHaveBeenCalled();
  });

  it("onNavigationEnd", () => {
    spyOnProperty<any>(component, "queryParams", "get").and.returnValue({symptomID: "17"});
    const startSpy = spyOn(pageScrollService, "start").and.callThrough();
    component["onNavigationEnd"]();
    expect(startSpy).toHaveBeenCalled();
  });

  it("handleActiveIllnessValue", () => {
    const consoleSpy = spyOn(console, "error").and.callThrough();
    const illness = {
      form: { groupsComplete: ["group"] }
    };

    spyOn(denormalizedModel, "denormalizeIllnessValue").and.callFake(val => val);
    component["illRootForm"] = new FormGroup({
      groupsComplete: new FormControl("")
    });
    component["handleActiveIllnessValue"](<any>illness);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("handleActiveIllnessValue", () => {
    const consoleSpy = spyOn(console, "error").and.callThrough();
    const illness = {
      form: { groupsComplete: ["group"] }
    };

    spyOn(denormalizedModel, "denormalizeIllnessValue").and.callFake(val => val);
    component["illRootForm"] = new FormGroup({
      groups: new FormControl("")
    });
    component["handleActiveIllnessValue"](<any>illness);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("onActiveIllnessValue", () => {
    const v = {
      form: {
        idIcd10Code: "17"
      }
    } as IllnessValue;
    spyOn(createFormUtils, "formGroupFactory").and.returnValue(new FormGroup({}));
    component["illRootFormSub"] = of({}).subscribe();
    const unsubSpy = spyOn<any>(component["illRootFormSub"], "unsubscribe").and.callThrough();
    component["onActiveIllnessValue"](v);
    expect(unsubSpy).toHaveBeenCalled();
  });

  it("onActiveIllnessValue", () => {
    component["illRootFormSub"] = null;
    spyOn(createFormUtils, "formGroupFactory").and.returnValue(new FormGroup({}));
    const formValue = {
      form: {
        idIcd10Code: "17"
      }
    } as IllnessValue;
    expect(component["onActiveIllnessValue"](formValue)).toBeUndefined();
  });

  it("queryParams", () => {
    expect(component["queryParams"]).toBeDefined();
  });

  it("exists", () => {
    expect(component["exists"](null)).toBeFalsy();
  });

  it("isNavigationEnd", () => {
    const ev = new NavigationEnd(1, "", "");
    expect(component["isNavigationEnd"](ev)).toBeTruthy();
  });

  it("hasEqualGroups", () => {
    const value = {
      form: {
        groupsComplete: []
      }
    } as any;
    expect(component["hasEqualGroups"](value, value)).toBeTruthy();
  });

  it("hasSameCode", () => {
    const value = {
      form: {
        idIcd10Code: "A"
      }
    } as any;
    expect(component["hasSameCode"](value, value)).toBeTruthy();
  });

  it("onError", () => {
    const consoleSpy = spyOn(console, "error").and.callThrough();
    component["onError"]({});
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("onShowIllnessErrors", () => {
    component["illnessErrorsAreShowing"] = true;
    component["onShowIllnessErrors"](false);
    expect(component["illnessErrorsAreShowing"]).toBeFalsy();
  });

  it("onCheckDataVersionError", () => {
    const consoleSpy = spyOn(console, "error").and.callThrough();
    component["onCheckDataVersionError"]({});
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("trackIllnessError", () => {
    const illnessErrorTrackerSpy = spyOn(illnessValidators, "illnessErrorTracker").and.callFake(() => {});

    component["illRootForm"] = new FormGroup({});
    component["trackIllnessError"]();
    expect(illnessErrorTrackerSpy).toHaveBeenCalled();
  });

  it("onRootIllFormError", () => {
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();
    component["onRootIllFormError"]({});
    expect(dispatchSpy).toHaveBeenCalled();
  });
});
