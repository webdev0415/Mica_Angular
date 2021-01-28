import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {CheckSwitchComponent} from "./check-switch.component";

describe("CheckSwitchComponent", () => {
  let component: CheckSwitchComponent;
  let fixture: ComponentFixture<CheckSwitchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CheckSwitchComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckSwitchComponent);
    component = fixture.componentInstance;
    component.valueNames = ["val1", "val2"];
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("writeValue", () => {
    component.writeValue(true);
    expect(component.value).toBeTruthy();
  });

  it("registerOnTouched", () => {
    component.registerOnTouched();
  });

  it("registerOnChange", () => {
    const res = {};
    const fn = (_: any) => res;
    component.registerOnChange(fn);
    expect(component.propagateChange(0)).toBeTruthy();
  });

  it("should throw on init", () => {
    component.valueNames  = null;
    expect(() => component.ngOnInit()).toThrow();
  });

  it("writeValue", () => {
    component.writeValue(null);
    expect(component.value).toEqual(false);
  });

  it("writeValue", () => {
    expect(() => component.writeValue(<any>"1")).toThrow();
  });

});
