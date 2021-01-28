import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { InspectorComponent } from "./inspector.component";
import { DataValidationComponent } from "../data-validation/data-validation.component";
import { Component, Input } from "@angular/core";
import { ErrorBoxComponent } from "../../../error-reporting/box/box.component";
import { defaultState } from "app/app.config";
import { NgRedux } from "@angular-redux/store";
import { NavigationStart } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { of } from "rxjs/observable/of";
import * as illnessValidators from "app/util/forms/validators/illness-value";
import {validateIllnessValue} from "app/util/forms/validators/illness-value";

const mockRedux = {
  getState: (): State.Root => {
    return defaultState
  },
  select: (selector) => of(selector(defaultState)),
  dispatch: (arg: any) => {}
};

@Component({
  selector: "review-symptom-groups",
  template: "<div></div>"
})
class MockSymptomGroupsComponent {
  @Input() readOnly = false;
}

@Component({
  selector: "review-illness-search",
  template: "<div></div>"
})
class MockIllnessSearchComponent {}

describe("InspectorComponent", () => {
  let component: InspectorComponent;
  let fixture: ComponentFixture<InspectorComponent>;
  let redux: NgRedux<State.Root>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        InspectorComponent,
        DataValidationComponent,
        MockIllnessSearchComponent,
        MockSymptomGroupsComponent,
        ErrorBoxComponent
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux }
      ],
      imports: [
        RouterTestingModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InspectorComponent);
    redux = TestBed.get(NgRedux);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("state", () => {
    expect(component["state"]).toBeDefined();
  });

  it("isNeededEvent", () => {
    const ev = new NavigationStart(0, "");
    expect(component["isNeededEvent"](ev)).toBeTruthy();
  });

  it("onRouteChange", () => {
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();
    component["onRouteChange"]();
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it("onReadonlyIllness", () => {
    const validateIllnessValueSpy = spyOn(illnessValidators, "validateIllnessValue").and.returnValue(true);

    component["onReadonlyIllness"](null);
    expect(validateIllnessValueSpy).toHaveBeenCalled();
  });

  it("onReadonlyIllness", () => {
    const validateIllnessValueSpy = spyOn(illnessValidators, "validateIllnessValue").and.throwError("error");

    component["onReadonlyIllness"](null);
    expect(validateIllnessValueSpy).toHaveBeenCalled();
  });

  it("exists", () => {
    expect(component["exists"](null)).toBeFalsy();
  });

});
