import * as _ from "lodash";
import { of } from "rxjs/observable/of";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Component, EventEmitter, Input, TemplateRef } from "@angular/core";
import { Router } from "@angular/router";
import { NgRedux } from "@angular-redux/store";
import { async, ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";

import { IllnessSearchComponent } from "./illness-search.component";
import { DropdownContext } from "../../../typeahead/dropdown/dropdown.component";
import { SyncingBtnComponent } from "../syncing-btn/syncing-btn.component";
import { InlineSpinnerComponent } from "../../../spinner/inline-spinner/inline-spinner.component";

import { IllnessServiceStub } from "../../../../../test/services-stubs/illness.service.stub";
import { IllnessService } from "app/services/illness.service";
import { ValidationService } from "app/modules/validation/validation.service";
import { ValidationServiceStub } from "test/services-stubs/validation.service.stub";

import { editReadOnlyIllness, setReadOnlyIllness } from "app/state/workbench/workbench.actions";
import * as taskSelectors from "app/state/task/task.selectors";
import * as workbenchSelectors from "app/state/workbench/workbench.selectors";
import * as userSelectors from "app/state/user/user.selectors";

import FormValue = Illness.FormValue;
import { defaultState } from "app/app.config";

const fakeIllnesses: Illness.Normalized.IllnessValue[] = require("../../../../../test/data/illnesses.json");
const fakeTasks = require("../../../../../test/data/tasks.json").tasks;
const state = _.cloneDeep(defaultState);
const illStatusResponse = {
  status: 200,
  count: 1,
  idIcd10Codes: [fakeTasks[0].illness.idIcd10Code]
};

const mockRedux = {
  getState: (): State.Root => {
    return state
  },
  select: (selector: any) => of(selector(state)),
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
  @Input() items: MICA.SelectableEl[];
  @Input() urlQuery = "";
  @Input() liveSearchType: MICA.LiveSearchType;
  @Input() templateRef: TemplateRef<DropdownContext>;
  @Input() dropdownAlignment = "left";
  @Input() sortByKey: string | string[] = "name";
  @Input() required = true;
  @Input() icd10CodeSearch: boolean;
}

describe("IllnessSearchComponent", () => {
  let component: IllnessSearchComponent;
  let fixture: ComponentFixture<IllnessSearchComponent>;
  let redux: NgRedux<State.Root>;
  let router: Router;
  let illnessService: IllnessServiceStub;
  let validationService: ValidationServiceStub;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        IllnessSearchComponent,
        MockTypeaheadComponent,
        SyncingBtnComponent,
        InlineSpinnerComponent
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        { provide: IllnessService, useClass: IllnessServiceStub },
        { provide: ValidationService, useClass: ValidationServiceStub }
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    redux = TestBed.get(NgRedux);
    router = TestBed.get(Router);
    illnessService = TestBed.get(IllnessService);
    validationService = TestBed.get(ValidationService);
    fixture = TestBed.createComponent(IllnessSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("method trackByFn", () => {
    const illnessValue = fakeIllnesses[0];
    const illnessFormValue: Illness.FormValue = _.assign(
      {symptomGroups: []},
      _.omit(illnessValue.form, ["symptomGroups"])
    ) as Illness.FormValue;
    const illness: MICA.LiveSearchTypeaheadResult = {
      name: illnessFormValue.name,
      origin: illnessFormValue.idIcd10Code,
      value: illnessFormValue
    };
    const idIcd10Code = component.trackByFn(0, illness);

    expect(idIcd10Code).toEqual(illnessFormValue.idIcd10Code);
  });

  it("method onSelectIllness", () => {
    const illnessValue = fakeIllnesses[0];
    const illnessFormValue: Illness.FormValue = _.assign({symptomGroups: []}, _.omit(illnessValue.form, ["symptomGroups"])) as Illness.FormValue;
    const illness: MICA.LiveSearchTypeaheadResult = {
      name: illnessFormValue.name,
      origin: illnessFormValue.idIcd10Code,
      value: illnessFormValue
    };
    const emitter: EventEmitter<any> = new EventEmitter();
    const mockEmit = spyOn(emitter, "emit").and.callThrough();

    component.onSelectIllness(illness, emitter);
    expect(mockEmit).toHaveBeenCalledWith({name: illnessFormValue.name, value: illnessFormValue.idIcd10Code});
    expect(component.illnessToInspect).toEqual(illnessFormValue);
  });

  it("method onInspectIllness", () => {
    const illnessValue = fakeIllnesses[0];
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    const mockSetValue = spyOn(component.selectedIllnessCode, "setValue").and.callThrough();
    const illnessToInspect = _.assign({ symptomGroups: [] }, _.omit(illnessValue.form, ["symptomGroups"])) as Illness.FormValue;
    const param = setReadOnlyIllness(illnessToInspect);

    component.illnessToInspect = illnessToInspect;

    component.onInspectIllness();
    expect(mockDispatch).toHaveBeenCalledWith(param);
    expect(mockSetValue).toHaveBeenCalledWith("");
    expect(component.illnessToInspect).toBe(null);
  });

  it("method onEditIllness", () => {
    const mockLocalTask = spyOn(taskSelectors, "localTask");
    const mockUpdateIllStatus = spyOn(illnessService, "updateIllStatus");
    const mockEditIllness = spyOn<any>(component, "editIllness").and.callFake(() => {});

    mockUpdateIllStatus.and.returnValue(of(illStatusResponse));
    mockLocalTask.and.returnValue(false);

    component.onEditIllness();
    expect(mockUpdateIllStatus).not.toHaveBeenCalled();
    expect(mockEditIllness).not.toHaveBeenCalled();
    expect(editReadOnlyIllness()({ ...defaultState })).toBeDefined();
  });

  it("method onEditIllness should update illness status if localTask less than 5", fakeAsync(() => {
    const mockEditIllness = spyOn<any>(component, "editIllness").and.callFake(() => {});
    const mockUpdateIllStatus = spyOn(illnessService, "updateIllStatus").and.returnValue(of(illStatusResponse));

    spyOn(taskSelectors, "localTask").and.returnValue({ illness: [1, 2, 3, 4] });
    spyOn(workbenchSelectors, "readOnlyIllness").and.returnValue(fakeIllnesses[0]);

    component.onEditIllness();
    tick();
    expect(mockUpdateIllStatus).toHaveBeenCalled();
    expect(mockEditIllness).toHaveBeenCalled();
  }));

  it("method onEditIllness if localTask more than 5", () => {
    const mockLocalTask = spyOn(taskSelectors, "localTask");
    const mockReadOnlyIllness = spyOn(workbenchSelectors, "readOnlyIllness");
    const mockEditIllness = spyOn<any>(component, "editIllness").and.callFake(() => {});
    const mockUpdateIllStatus = spyOn(illnessService, "updateIllStatus");

    mockUpdateIllStatus.and.returnValue(of(illStatusResponse));
    mockReadOnlyIllness.and.returnValue(fakeIllnesses[0]);

    mockLocalTask.and.returnValue({illness: [1, 2, 3, 4, 5, 6]});
    component.onEditIllness();
    expect(mockUpdateIllStatus).not.toHaveBeenCalled();
    expect(mockEditIllness).not.toHaveBeenCalled();
  });

  it("method onEditIllness shouldn\"t update illness status if there is no readonly illness", () => {
    const mockLocalTask = spyOn(taskSelectors, "localTask");
    const mockReadOnlyIllness = spyOn(workbenchSelectors, "readOnlyIllness");
    const mockUpdateIllStatus = spyOn(illnessService, "updateIllStatus");
    const mockEditIllness = spyOn<any>(component, "editIllness").and.callFake(() => {});

    mockUpdateIllStatus.and.returnValue(of(illStatusResponse));
    mockLocalTask.and.returnValue(false);
    mockReadOnlyIllness.and.returnValue(null);
    component.onEditIllness();
    expect(mockUpdateIllStatus).not.toHaveBeenCalled();
    expect(mockEditIllness).not.toHaveBeenCalled();
  });

  it("method onEditIllness should update illness status if there is readonly illness", () => {
    const mockLocalTask = spyOn(taskSelectors, "localTask");
    const mockReadOnlyIllness = spyOn(workbenchSelectors, "readOnlyIllness");
    const mockUpdateIllStatus = spyOn(illnessService, "updateIllStatus");
    const mockEditIllness = spyOn<any>(component, "editIllness").and.callFake(() => {});

    mockUpdateIllStatus.and.returnValue(of(illStatusResponse));
    mockLocalTask.and.returnValue(false);
    mockReadOnlyIllness.and.returnValue(fakeIllnesses[0]);
    component.onEditIllness();
    expect(mockUpdateIllStatus).toHaveBeenCalled();
    expect(mockEditIllness).toHaveBeenCalled();
  });

  it("noSearchInspect", () => {
    const searchType = true;

    component.noSearchInspect(searchType);
    expect(component.noSearchInput).toEqual(searchType);
  });

  it("noSearchInspect", () => {
    const searchType = false;

    component.noSearchInspect(searchType);
    expect(component.noSearchInput).toEqual(searchType);
  });

  it("onUpdateIllStatusError", () => {
    const consoleSpy = spyOn(console, "error").and.callThrough();
    const err = {
      status: "Illnesses already exists with target state"
    };

    component["onUpdateIllStatusError"](err, of({}));
    expect(consoleSpy).toHaveBeenCalledWith(err.status);
  });

  it("onUpdateIllStatusError", fakeAsync(() => {
    const consoleSpy = spyOn(console, "error").and.callThrough();
    const err = {
      status: "Status"
    };

    expect(() => {
      component["onUpdateIllStatusError"](err, of({})).subscribe(res => res);
      tick();
    }).toThrow();
    expect(consoleSpy).not.toHaveBeenCalled();
  }));

  it("insertLocalIllness: if active illness exists", () => {
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();
    const addSymptomsErrorsToTODOSpy = spyOn(validationService, "addSymptomsErrorsToTODO").and.callFake(() => {});
    const mockNavigate = spyOn(router, "navigate").and.callFake(() => {});

    spyOn(workbenchSelectors, "activeIllnessValue").and.returnValue({});
    component["insertLocalIllness"]({} as FormValue);
    expect(dispatchSpy).toHaveBeenCalled();
    expect(addSymptomsErrorsToTODOSpy).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("insertLocalIllness: if no active illness", () => {
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();
    const addSymptomsErrorsToTODOSpy = spyOn(validationService, "addSymptomsErrorsToTODO").and.callFake(() => {});
    const mockNavigate = spyOn(router, "navigate").and.callFake(() => {});

    spyOn(workbenchSelectors, "activeIllnessValue").and.returnValue(null);
    component["insertLocalIllness"]({} as FormValue);
    expect(dispatchSpy).toHaveBeenCalled();
    expect(addSymptomsErrorsToTODOSpy).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("stateName", () => {
    spyOn(userSelectors, "isReviewer").and.returnValue(true);
    expect(component["stateName"]).toEqual(component["stateNames"]["readyForReview"]);
  });

  it("editIllness", () => {
    const illness = fakeIllnesses[0].form;
    const states = ["PENDING"];
    const getUserIllnessSavedByStateSpy = spyOn(illnessService, "getUserIllnessSavedByState").and.callThrough();
    const insertLocalIllnessSpy = spyOn<any>(component, "insertLocalIllness").and.callFake(() => {});

    spyOnProperty<any>(component, "stateName", "get").and.returnValue(states[0]);
    component["editIllness"](illness);

    expect(getUserIllnessSavedByStateSpy).toHaveBeenCalledWith(states);
    expect(insertLocalIllnessSpy).toHaveBeenCalled();
  });

});
