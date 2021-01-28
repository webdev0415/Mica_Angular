/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { BiasComponent } from './bias.component';

describe('BiasComponent', () => {
  let component: BiasComponent;
  let fixture: ComponentFixture<BiasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BiasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BiasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should toggleValue", () => {
    component.ctrl.setValue(true);
    component.toggleValue();
    expect(component.ctrl.value).toBeFalsy();
  });

  it("should toggleValue", () => {
    component.ctrl.setValue(true);
    component.readOnly = true;
    component.toggleValue();
    expect(component.ctrl.value).toBe(true);
  });

  it("writeValue", () => {
    expect(component.writeValue(undefined)).toBeUndefined();
  });
});
