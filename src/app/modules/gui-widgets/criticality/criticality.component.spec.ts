import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CriticalityComponent } from './criticality.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

describe('CriticalityComponent', () => {
  let component: CriticalityComponent;
  let fixture: ComponentFixture<CriticalityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CriticalityComponent ],
      imports: [
        FormsModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CriticalityComponent);
    component = fixture.componentInstance;
    component.max = 5;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it("ngOnInit", () => {
    component.max = undefined;
    expect(() => component.ngOnInit()).toThrow();
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
