import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiplierInputComponent } from './input.component';
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";

describe('MultiplierInputComponent', () => {
  let component: MultiplierInputComponent;
  let fixture: ComponentFixture<MultiplierInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiplierInputComponent ],
      imports: [
        FormsModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiplierInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("registerOnTouched", () => {
    component.ctrl = new FormControl("");
    expect(component.registerOnTouched()).toBeUndefined();
  });

  it("writeValue", () => {
    const setValueSpy = spyOn(component.ctrl, "setValue").and.callThrough();
    expect(component.writeValue(undefined)).toBeUndefined();
    expect(setValueSpy).not.toHaveBeenCalled();
  });

  it("validationClass", () => {
    component.ctrl = new FormControl("");
    expect(component.validationClass).toEqual("");
  });


});
