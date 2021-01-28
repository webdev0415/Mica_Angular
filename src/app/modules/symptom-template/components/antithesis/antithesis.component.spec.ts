import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AntithesisComponent } from './antithesis.component';
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";

describe('AntithesisComponent', () => {
  let component: AntithesisComponent;
  let fixture: ComponentFixture<AntithesisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AntithesisComponent ],
      imports: [
        FormsModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AntithesisComponent);
    component = fixture.componentInstance;
    component.minMaxRange = [0.1, 0.3];
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it("ngOnInit", () => {
    component.minMaxRange = undefined;
    expect(() => component.ngOnInit()).toThrow();
  });

  it("validate", () => {
    component["validateFn"] = (control: FormControl): any => {return true};
    expect(component.validate(new FormControl(""))).toBeDefined();
  });

  it("ngOnDestroy", () => {
    component.value = new FormControl("");
    const setValueSpy = spyOn(component.value, "setValue").and.callThrough();
    component.ngOnDestroy();
    expect(setValueSpy).not.toHaveBeenCalled();
  });

  it("writeValue", () => {
    const setValueSpy = spyOn(component.value, "setValue").and.callThrough();
    component.writeValue(undefined);
    expect(setValueSpy).not.toHaveBeenCalled();
  });

  it("writeValue", () => {
    const setValueSpy = spyOn(component.value, "setValue").and.callThrough();
    component.writeValue("val");
    expect(setValueSpy).toHaveBeenCalled();
  });

  it("registerOnChange", () => {
    const fn = (_: any) => {};
    component.registerOnChange(fn as any);
    expect(component.propagateChange).toEqual(fn);
  });

  it("registerOnTouched", () => {
     expect(component.registerOnTouched()).toBeUndefined();
  });
});
