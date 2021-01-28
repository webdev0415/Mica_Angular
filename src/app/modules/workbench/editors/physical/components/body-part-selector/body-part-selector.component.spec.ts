import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { BodyPartSelectorComponent } from "./body-part-selector.component";
import { ChipsComponent } from "../../../../../gui-widgets/components/chips/chips.component";
import { FormControl } from "@angular/forms";

describe("BodyPartSelectorComponent", () => {
  let component: BodyPartSelectorComponent;
  let fixture: ComponentFixture<BodyPartSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        BodyPartSelectorComponent,
        ChipsComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BodyPartSelectorComponent);
    component = fixture.componentInstance;
    component.bodyPartsAll = [];
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("should set propagateChange", () =>  {
    const propagateChange = (_: any) => {return {}};
    component.registerOnChange(propagateChange);
    expect(component.propagateChange).toEqual(propagateChange);
  });
  //
  it("should call registerOnTouched", () =>  {
    expect(component.registerOnTouched()).toBeUndefined();
  });

  it("should call propagateChange", () =>  {
    const valueSub = component.ctrl.valueChanges;
    component.ctrl.setValue([]);
    const propagateChange = spyOn(component, "propagateChange").and.callThrough();
    valueSub.subscribe(v => {
      expect(propagateChange).toHaveBeenCalledWith(v);
    })
  });

  it("should write value", () => {
    const setValueSpy = spyOn(component.ctrl, "setValue").and.callThrough();
    const value = ["1"];
    component.writeValue(value);
    expect(setValueSpy).toHaveBeenCalledWith(value);
  });

  it("should remove body part", () => {
    component.ctrl = new FormControl(["1", "2", "3"]);
    const setValueSpy = spyOn(component.ctrl, "setValue").and.callThrough();
    component.onBodyPartRemove("2");
    expect(setValueSpy).toHaveBeenCalledWith(["1", "3"]);
  });

  it("should return trimmed part", () => {
    expect(component.partTrimmed("left arm")).toEqual("arm");
  });

  it("partIsActive", () => {
    component.ctrl = new FormControl(["left arm"]);
    expect(component.partIsActive("arm")).toEqual(false);
  });

  it("should filter parts", () => {
    component.bodyPartsAll = ["left arm", "left leg", "right arm"];
    expect(component["filterParts"]("left")).toEqual(["left arm", "left leg"]);
  });

  it("sideRow", () => {
    component.bodyPartsAll = ["left arm", "left leg", "right arm"];
    expect(component.sideRow("left", 0)).toEqual(["left arm", "left leg"]);
  });

  it("writeValue", () => {
    expect(component.writeValue(undefined)).toBeUndefined();
  });

  it("onBodyPartRemove", () => {
    expect(component.onBodyPartRemove("part")).toBeUndefined();
  });
});
