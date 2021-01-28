import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {DropdownComponent} from "./dropdown.component";
import {SimpleChange, SimpleChanges} from "@angular/core";

describe("DropdownComponent", () => {
  let component: DropdownComponent;
  let fixture: ComponentFixture<DropdownComponent>;
  let items = [{
    name: "name1",
    value: 0,
    origin: "name1",
    defaultValue: true
  }, {
    name: "name2",
    value: 1,
    origin: "name2",
    defaultValue: true
  }];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DropdownComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownComponent);
    component = fixture.componentInstance;
    component.items = items;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("ngOnChanges", () => {
    component["btnEls"][1].focus();
    component.ngOnChanges({items: new SimpleChange(items, null, true)});
    expect(component["btnEls"][0]).not.toEqual(document.activeElement as HTMLButtonElement);
    component.ngOnChanges({items: new SimpleChange(items[0].name, "changed", false)});
    expect(component["btnEls"][0]).toEqual(document.activeElement as HTMLButtonElement);
  });

  it("keydown.Esc", () => {
    let result;
    component.outOfFocus.subscribe(res => result = res);
    fixture.nativeElement.dispatchEvent(new KeyboardEvent("keydown", {
      "key": "Escape"
    }));
    expect(result).toBeTruthy();
  });

  it("keydown.ArrowDown", () => {
    let idx = 0;
    const event = new KeyboardEvent("keydown", {key: "ArrowDown"});

    component["activeIdx"] = idx;
    fixture.nativeElement.dispatchEvent(event);
    expect(component.keepFocus).toBeFalsy();
    expect(component["btnEls"][idx + 1]).toEqual(document.activeElement as HTMLButtonElement);

    idx = component["btnEls"].length;
    component["activeIdx"] = idx;
    fixture.nativeElement.dispatchEvent(event);
    expect(component.keepFocus).toBeFalsy();
    expect(component["btnEls"][0]).toEqual(document.activeElement as HTMLButtonElement);
  });

  it("keydown.ArrowUp", () => {
    let idx = 0;
    const event = new KeyboardEvent("keydown", {key: "ArrowUp"});

    component["activeIdx"] = idx;
    fixture.nativeElement.dispatchEvent(event);
    expect(component.keepFocus).toBeFalsy();
    expect(component["btnEls"][component["btnEls"].length - 1]).toEqual(document.activeElement as HTMLButtonElement);

    idx = component["btnEls"].length;
    component["activeIdx"] = idx;
    fixture.nativeElement.dispatchEvent(event);
    expect(component.keepFocus).toBeFalsy();
    expect(component["btnEls"][idx - 1]).toEqual(document.activeElement as HTMLButtonElement);
  });

  it("onMouseOver", () => {
    let idx = 0;
    component.onMouseOver(idx);
    expect(component.keepFocus).toBeTruthy();
    expect(component["activeIdx"]).toEqual(idx);

    idx = 1;
    component.onMouseOver(idx);
    expect(component.keepFocus).toBeTruthy();
    expect(component["activeIdx"]).toEqual(idx);
    expect(component["btnEls"][idx]).toEqual(document.activeElement as HTMLButtonElement);
  });

  it("onBlur", () => {
    let result;
    component.outOfFocus.subscribe(res => result = res);
    component.onBlur();
    expect(result).toBeTruthy();

    component.outOfFocus.emit(false);
    component.keepFocus = true;
    component.onBlur();
    expect(result).toBeFalsy();
  });

  it("ngOnInit", () => {
    component.align = "right";
    component.ngOnInit();
    expect(component.className.indexOf("dropdown-menu-right")).toBeGreaterThan(-1);
  });

  it("onDocumentClick", () => {
    const searchInputElement = document.createElement("div");
    const target = document.createElement("div");
    const evt = {
      target: target
    } as any;
    const elementRef = {
      nativeElement: searchInputElement
    };
    const outOfFocusEmitSpy = spyOn(component.outOfFocus, "emit").and.callThrough();
    spyOn<any>(component, "el").and.returnValue(elementRef);

    component.searchInput = searchInputElement;
    component.onDocumentClick(evt);

    expect(outOfFocusEmitSpy).toHaveBeenCalled();
  });

  it("onDocumentClick", () => {
    const target = document.createElement("div");
    const evt = {
      target: target
    } as any;
    const elementRef = {
      nativeElement: target
    };
    const outOfFocusEmitSpy = spyOn(component.outOfFocus, "emit").and.callThrough();
    spyOn<any>(component, "el").and.returnValue(elementRef);

    component.searchInput = target;
    component.onDocumentClick(evt);

    expect(outOfFocusEmitSpy).not.toHaveBeenCalled();
  });
});
