import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {EditAntithesisComponent} from "./edit-antithesis.component";
import {AbstractControl, FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";

describe('EditAntithesisComponent', () => {
  let component: EditAntithesisComponent;
  let fixture: ComponentFixture<EditAntithesisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAntithesisComponent ],
      imports: [
        FormsModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAntithesisComponent);
    component = fixture.componentInstance;
    component.minMaxRange = [0.1, 0.3];
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it("ngOnInit", () => {
    component.minMaxRange = null;
    expect(() => component.ngOnInit()).toThrow();
  });

  it("ngOnInit", () => {
    component.minMaxRange = [1, 10];
    component.ngOnInit();
    expect(component.validate(new FormControl(7))).toEqual(null);
  });

  it("writeValue", () => {
    const setValueSpy = spyOn(component.value, "setValue").and.callThrough();
    const val = "17";
    component.writeValue(val);
    expect(setValueSpy).toHaveBeenCalledWith(val);
  });

  it("writeValue", () => {
    expect(component.writeValue(undefined)).toBeUndefined();
  });

  it("validate", () => {
    component["validateFn"] = (val) => (control: AbstractControl) => true;
    expect(component.validate(new FormControl("value"))).toBeNull();
  });

  it("registerOnChange", () => {
    const fn = () => {};
    component.registerOnChange(fn as any);
    expect(component.propagateChange).toEqual(fn);
  });

  it("registerOnTouched", () => {
    expect(component.registerOnTouched()).toBeUndefined();
  });

});
