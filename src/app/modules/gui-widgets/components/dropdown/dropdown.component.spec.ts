import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { DropdownComponent } from "./dropdown.component";
import { FormControl } from "@angular/forms";
import SelectableEl = MICA.SelectableEl;
import { ElementRef } from "@angular/core";

describe("DropdownComponent", () => {
  let component: DropdownComponent;
  let fixture: ComponentFixture<DropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("valueName", () => {
    const val = "val";
    const name = "name";
    component.ctrl = new FormControl(val);
    spyOnProperty(component, "selectables", "get").and.returnValue([{value: val, name: name}]);
    expect(component.valueName).toEqual(name);
  });

  it("registerOnTouched", () => {
    component.ctrl.setErrors({valid: false});
    const updateValueSpy = spyOn(component.ctrl, "updateValueAndValidity").and.callThrough();
    component.registerOnTouched();
    expect(updateValueSpy).toHaveBeenCalled();
  });

  it("writeValue", () => {
    const updateValueSpy = spyOn(component.ctrl, "updateValueAndValidity").and.callThrough();
    component.writeValue(undefined);
    expect(updateValueSpy).not.toHaveBeenCalled();
  });

  it("dropdownItems", () => {
    const selectables = [{name: "name"}, {value: "value"}];

    component.ctrl = new FormControl("1234");
    component.excludeItems = [["val", "name"]];
    spyOnProperty(component, "selectables", "get").and.returnValue(selectables);
    expect(component.dropdownItems).toBeDefined();
  });

  it("dropdownItems", () => {
    spyOnProperty(component, "selectables", "get").and.returnValue([{name: "name"}]);
    component.ctrl = new FormControl("ctrlValue");
    component.multiSelect = true;
    component.excludeItems = [["excluded item"]];
    expect(component.dropdownItems.length).toEqual(1);
  });

  it("toggleValue", () => {
    component.ctrl = new FormControl(true);
    component.toggleValue();
    expect(component.ctrl.value).toBeFalsy();
  });

  it("selectables", () => {
    component.items = [{name: "name"} as SelectableEl];
    expect(component.selectables.length).toEqual(1);
  });

  it("selectedItems: ctrl value is set", () => {
    const values = [
      { name: "one", value: "1" },
      { name: null, value: "2" },
    ];

    spyOnProperty(component, "selectables", "get").and.returnValue(values);
    component.ctrl = new FormControl("1,2,3");
    expect(component.selectedItems).toEqual("one, 2, 3");
  });

  it("selectedItems: ctrl value is empty", () => {
    component.ctrl = new FormControl("");
    expect(component.selectedItems).toEqual("");
  });

  it("valueSelected", () => {
    const valueToCheck = "value";
    const ctrlValue = "test,value";
    component.ctrl = new FormControl(ctrlValue);
    expect(component.valueSelected(valueToCheck)).toBeTruthy();
  });

  it("onValueClick", () => {
    const evt = {
      stopPropagation: () => {}
    };
    const value = "value";
    component.ctrl = new FormControl(",value");
    const setValueSpy = spyOn(component.ctrl, "setValue").and.callThrough();
    component.onValueClick(evt as any, value);
    expect(setValueSpy).toHaveBeenCalled();
  });

  it("onValueClick", () => {
    const evt = {
      stopPropagation: () => {}
    };
    const stopPropagationSpy = spyOn(evt, "stopPropagation").and.callThrough();
    spyOnProperty(component, "dropdownItems", "get").and.returnValue([{}, {}, {}]);
    const value = "value";
    component.ctrl = new FormControl("val");
    const setValueSpy = spyOn(component.ctrl, "setValue").and.callThrough();
    component.onValueClick(evt as any, value);
    expect(setValueSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it("closeDropdown", () => {
    const nativeElement = document.createElement("div");
    const eventTarget = document.createElement("div");
    const elementRef = {
      nativeElement: nativeElement
    } as ElementRef;
    const evt = {
      target: eventTarget
    } as any;
    spyOn(document, "removeEventListener").and.callFake(() => {});
    spyOn(component["cd"], "detectChanges").and.callFake(() => {});
    spyOn<any>(component, "elementRef").and.returnValue(elementRef)
    component.isActive = true;
    component.listenerFunc = () => {};
    component.closeDropdown(evt);
    expect(component.isActive).toBeFalsy();
  });

  it("closeDropdown", () => {
    const nativeElement = document.createElement("div");
    const eventTarget = document.createElement("div");
    const elementRef = {
      nativeElement: nativeElement
    } as ElementRef;
    const evt = {
      target: eventTarget
    } as any;
    spyOn<any>(component, "elementRef").and.returnValue(elementRef);
    component.isActive = false;
    component.listenerFunc = () => {};
    component.closeDropdown(evt);
    expect(component.isActive).toBeFalsy();
  });

  it("showDropdown controlDisabled", () => {
    component.controlDisabled = true;
    component.isActive = false;
    component.showDropdown();
    expect(component.isActive).toBe(false);
  });

  it("showDropdown", () => {
    const addSpy = spyOn(document, "addEventListener").and.callFake(() => {});
    spyOn(document, "removeEventListener").and.callFake(() => {});
    component.isActive = false;
    component.showDropdown();
    expect(component.isActive).toBe(true);
    expect(addSpy).toHaveBeenCalled();
  });

  it("showDropdown", () => {
    spyOn(document, "addEventListener").and.callFake(() => {});
    const removeSpy = spyOn(document, "removeEventListener").and.callFake(() => {});
    component.isActive = true;
    component.showDropdown();
    expect(removeSpy).toHaveBeenCalled();
  });

});
