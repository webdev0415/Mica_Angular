import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { RangerComponent } from "./ranger.component";
import {FormControl, FormsModule, ReactiveFormsModule, FormGroup} from "@angular/forms";

describe("RangerComponent", () => {
  let component: RangerComponent;
  let fixture: ComponentFixture<RangerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RangerComponent ],
      imports: [
        FormsModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RangerComponent);
    component = fixture.componentInstance;
    component.validRange = [2, 10];
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("registerOnChange", () => {
    const fn = () => {return {}};
    component.registerOnChange(fn);
    expect(component.propagateChange).toEqual(fn);
  });

  it("registerOnTouched", () => {
    let range = [2, 10];
    const mockUpdateValueAndValidity = spyOn(component["ctrl"], "updateValueAndValidity").and.callThrough();

    component["ctrl"].setValue(range);
    mockUpdateValueAndValidity.calls.reset();
    component.registerOnTouched();
    expect(mockUpdateValueAndValidity).not.toHaveBeenCalled();

    range = [1, 1];
    component["ctrl"].setValue(range);
    component.registerOnTouched();
    expect(mockUpdateValueAndValidity).toHaveBeenCalled();
  });

  it("writeValue", () => {
    let range: any[] = [2, 3];

    component.writeValue(range);
    expect([component.values.get("min").value, component.values.get("max").value]).toEqual(range);

    component.values.removeControl("min");
    component.values.removeControl("max");
    component.writeValue(range);
    expect(component.values.get("min")).toBeFalsy();
    expect(component.values.get("max")).toBeFalsy();

    component.writeValue([range[0].toString(), range[1].toString()]);
    expect(component.values.get("min")).toBeFalsy();
    expect(component.values.get("max")).toBeFalsy();

    component.values.setControl("min", new FormControl(range[0]));
    component.values.setControl("max", new FormControl(range[1]));
    component.writeValue([range[0].toString(), range[1].toString()]);
    expect([component.values.get("min").value, component.values.get("max").value]).toEqual(range);
  });

  it("validate", () => {
    const control = new FormControl();
    let range: any[] = [1, 1];

    component.writeValue(range);
    expect(component.validate(control)).toBeTruthy();
  });

  it("castValue", () => {
    let range: any[] = [1, 1];
    expect(component["castValue"]([range[0].toString(), range[1].toString()])).toEqual(range);

    range = [];
    expect(() => {component["castValue"](range)}).toThrow(jasmine.any(Error));
  });

  it("writeValue", () => {
    const setValueSpy = spyOn(component["ctrl"], "setValue").and.callThrough();
    component.writeValue([1, 2, 3]);
    expect(setValueSpy).not.toHaveBeenCalled();
  });

  it("ngOnInit", () => {
    component.values = new FormGroup({});
    component.readOnly = true;
    component.ngOnInit();
    expect(component.values.disabled).toBeTruthy();
  })

  it("ngOnDestroy clearTimeout", () => {
    component.timer = 1;
    const spyTimeout = spyOn(window, "clearTimeout");
    component.ngOnDestroy();
    expect(spyTimeout).toHaveBeenCalled()
  })

  it("ngOnDestroy", () => {
    component.timer = null;
    const spyTimeout = spyOn(window, "clearTimeout");
    component.ngOnDestroy();
    expect(spyTimeout).not.toHaveBeenCalled()
  })
});
