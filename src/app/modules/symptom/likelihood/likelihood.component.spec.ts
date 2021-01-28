import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { LikelihoodComponent } from "./likelihood.component";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";

describe("LikelihoodComponent", () => {
  let component: LikelihoodComponent;
  let fixture: ComponentFixture<LikelihoodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LikelihoodComponent ],
      imports: [
        FormsModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LikelihoodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("registerOnTouched", () => {
    component.ctrl.setErrors({valid: false});
    const updateValidaitySpy = spyOn(component.ctrl, "updateValueAndValidity").and.callThrough();
    component.registerOnTouched();
    expect(updateValidaitySpy).toHaveBeenCalled();
  });

  it("writeValue", () => {
    expect(component.writeValue(undefined)).toBeUndefined();
  });

  it("ngOnInit", () => {
    component.symptomData = {symptomID: "SYMPT0000003"} as Symptom.Data;
    component.ngOnInit();
    expect(component.btnValues[0].value).toEqual(2);
  });

  it("likelihoodValue", () => {
    component.ctrl = new FormControl("");
    const setValueSpy = spyOn(component.ctrl, "setValue").and.callThrough();
    component.likelihoodValue("value");
    expect(setValueSpy).toHaveBeenCalledWith("value");
  });

});
