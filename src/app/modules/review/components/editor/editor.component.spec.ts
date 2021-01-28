import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ReviewEditorComponent } from "./editor.component";
import { PageSpinnerComponent } from "../../../spinner/page-spinner/page-spinner.component";
import { DataValidationComponent } from "../data-validation/data-validation.component";
import { ErrorBoxComponent } from "../../../error-reporting/box/box.component";
import { Component } from "@angular/core";
import { defaultState } from "app/app.config";
import { NgRedux } from "@angular-redux/store";
import { SymptomService } from "app/services";
import { SymptomServiceStub } from "../../../../../test/services-stubs/symtom.service.stub";
import { TitleServiceStub } from "../../../../../test/services-stubs/title.service.stub";
import { TitleService } from "../../../global-providers/services/title.service";
import { RouterTestingModule } from "@angular/router/testing";
import { ValidationService } from "../../../validation/validation.service";
import { ValidationServiceStub } from "../../../../../test/services-stubs/validation.service.stub";
import { of } from "rxjs/observable/of";
import * as workbenchSelectors from "app/state/workbench/workbench.selectors";
import * as illnessValidators from "app/util/forms/validators/illness-value";
import * as denormalizedModel from "app/state/denormalized.model";

const mockRedux = {
  getState: (): State.Root => {
    return { ...defaultState };
  },
  select: (selector) => of(selector(defaultState)),
  dispatch: (arg: any) => {}
};

@Component({
  selector: "review-symptom-groups",
  template: "<div></div>"
})
class MockSymptomGroupsComponent {}

@Component({
  selector: "icd-report",
  template: "<div></div>"
})
class MockIcdReportComponent {}

describe("ReviewEditorComponent", () => {
  let component: ReviewEditorComponent;
  let fixture: ComponentFixture<ReviewEditorComponent>;
  let symptomService: SymptomServiceStub;
  let redux: NgRedux<State.Root>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ReviewEditorComponent,
        PageSpinnerComponent,
        DataValidationComponent,
        MockSymptomGroupsComponent,
        MockIcdReportComponent,
        ErrorBoxComponent
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        { provide: SymptomService, useClass: SymptomServiceStub },
        { provide: ValidationService, useClass: ValidationServiceStub },
        { provide: TitleService, useClass: TitleServiceStub },

      ],
      imports: [
        RouterTestingModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    symptomService = TestBed.get(SymptomService);
    redux = TestBed.get(NgRedux);
    spyOn(symptomService, "rehydrateSymptomGroups").and.returnValue(of(true));
    fixture = TestBed.createComponent(ReviewEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("handleIllness", () => {
    const denormalizeIllnessValueSpy = spyOn(denormalizedModel, "denormalizeIllnessValue").and.returnValue({});

    spyOn(illnessValidators, "validateIllnessValue").and.callFake(() => {});
    component["handleIllness"](null);
    expect(denormalizeIllnessValueSpy).toHaveBeenCalled();
  });

  it("handleIllness", () => {
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();

    spyOn(illnessValidators, "validateIllnessValue").and.throwError("message");
    spyOn(denormalizedModel, "denormalizeIllnessValue").and.returnValue({});
    component["handleIllness"](null);
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it("exists", () => {
    expect(component["exists"](1)).toBeTruthy();
  });

  it("handleError", () => {
    const message = "message";
    const err = new Error(message);
    const errorSpy = spyOn(console, "error").and.callThrough();
    component["handleError"](err).subscribe(m => {
      expect(m).toEqual(message);
    });
    expect(errorSpy).toHaveBeenCalled();
  });

  it("onDataLoaded", () => {
    spyOn(workbenchSelectors, "activeIllnessValue").and.returnValue(null);
    expect(() => component["onDataLoaded"]({})).toThrow();
  });
});
