import { async, ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";

import { TypeaheadComponent } from "./typeahead.component";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DropdownComponent } from "./dropdown/dropdown.component";
import { defaultState, navInit } from "../../app.config";
import { NgRedux, NgReduxModule } from "@angular-redux/store";
import { NgReduxTestingModule } from "@angular-redux/store/testing";
import { ApiService } from "./api.service";
import { TypeaheadApiServiceStub } from "../../../test/services-stubs/typeahead-api.service.stub";
import SelectableEl = MICA.SelectableEl;
import { BehaviorSubject, of } from "rxjs";
const fakeUsers = require("../../../test/data/users.json");

const mockRedux = {
  getState: () => {
    return {
      user: fakeUsers[0],
      nav: navInit
    }
  },
  dispatch: (arg: any) => {}
};

describe("TypeaheadComponent", () => {
  let component: TypeaheadComponent;
  let fixture: ComponentFixture<TypeaheadComponent>;
  let redux: NgRedux<State.Root>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TypeaheadComponent,
        DropdownComponent
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        { provide: NgReduxModule, useClass: NgReduxTestingModule },
        { provide: ApiService, useClass: TypeaheadApiServiceStub }
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TypeaheadComponent);
    redux = TestBed.get(NgRedux);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("gets state", () => {
    const getStateSpy = spyOn(redux, "getState").and.callThrough();
    const state = component.state;
    expect(getStateSpy).toHaveBeenCalled();
  });

  it("registerOnChange", () => {
    const fn = () => {return {}};
    component.registerOnChange(fn);
    expect(component.propagateChange).toEqual(fn);
  });

  it("propagateChange", () => {
    expect(component.propagateChange(null)).toBeUndefined();
  });

  it("registerOnTouched ", () => {
    expect(component.registerOnTouched()).toBeUndefined();
  });

  it("registerOnTouched", () => {
    expect(component.registerOnTouched()).toBeUndefined();
  });

  it("writeValue", () => {
    const setValueSpy = spyOn(component.ctrl, "setValue").and.callThrough();
    component.writeValue("17");
    expect(setValueSpy).toHaveBeenCalled();
  });

  it("validate", () => {
    const ctrl = new FormControl("");
    const formError = {invalid: true};
    ctrl.setErrors(formError);
    component.ctrl = ctrl;
    expect(component.validate(ctrl)).toEqual(formError);
  });

  it("resultFormatter", () => {
    component.resultKey = "name";
    expect(component.resultFormatter({name: "name"} as SelectableEl)).toEqual("name");
  });

  it("resultFormatter", () => {
    component.resultKey = null;
    expect(component.resultFormatter({name: "name", value: "name"} as SelectableEl)).toEqual("name");
  });

  it("resultFormatter", () => {
    component.resultKey = null;
    expect(component.resultFormatter({name: "name", value: "value"} as SelectableEl)).toEqual("value: name");
  });

  it("focusLost", () => {
    const closeSpy = spyOn(component.close, "emit").and.callThrough();
    const focusSpy = spyOn(component, "focusOnSearch").and.callThrough();
    component.canClose = false;
    component.focusLost();
    expect(closeSpy).toHaveBeenCalled();
    expect(component.showDropdown).toBeFalsy();
    expect(focusSpy).toHaveBeenCalled();
  });

  it("clickedOutside", () => {
    component.clickedOutside();
    expect(component.showDropdown).toBeFalsy();
  });

  it("focusOnSearch", () => {
    component.searchInput = null;
    expect(component.focusOnSearch()).toBeUndefined();
  });

  it("ngAfterViewInit", () => {
    component.canClose = false;
    expect(component.ngAfterViewInit()).toBeUndefined();
  });

  it("ngOnDestroy", () => {
    component["valueSub"] = null;
    expect(component.ngOnDestroy()).toBeUndefined();
  });

  it("writeValue", () => {
    const setValueSpy = spyOn(component.ctrl, "setValue").and.callThrough();
    component.writeValue(undefined);
    expect(setValueSpy).not.toHaveBeenCalled();
  });

  it("ngOnInit enableValidation invalid", () => {
    component.selectableItems = new BehaviorSubject([]);
    component.enableValidation = true;
    component.required = false;
    component.icd10CodeSearch = false
    component.ngOnInit()
    component.ctrl.setValue("")
    expect(component.ctrl.valid).toBe(true);
    component.ctrl.setValue("A1")
    expect(component.ctrl.valid).toBe(true);
    component.ctrl.setValue("//////")
    expect(component.ctrl.valid).toBe(true);
    component.ctrl.setValue("A123")
    expect(component.ctrl.valid).toBe(true);
  });

  it("ngOnInit enableValidation valid", () => {
    component.selectableItems = new BehaviorSubject([]);
    component.enableValidation = true;
    component.required = true;
    component.icd10CodeSearch = true
    component.ngOnInit()
    component.ctrl.setValue("A1")
    expect(component.ctrl.valid).toBe(false);
    component.ctrl.setValue("//////")
    expect(component.ctrl.valid).toBe(false);
    component.ctrl.setValue("")
    expect(component.ctrl.valid).toBe(false);
    component.ctrl.setValue("A123")
    expect(component.ctrl.valid).toBe(true);
  });

  it("ngOnInit", () => {
    component.selectableItems = new BehaviorSubject([]);
    component.enableValidation = false;
    component.formControl = new FormControl("val");
    component.readOnly = true;
    component.ctrl = new FormControl();
    component.ngOnInit();
    expect(component.initialState).toBeTruthy();
    expect(component.ctrl.disabled).toBeTruthy();
  });

  it("ngOnInit", () => {
    component.selectableItems = new BehaviorSubject([]);
    component.enableValidation = false;
    component.formControl = new FormControl("");
    component.ngOnInit();
    expect(component.initialState).toBeFalsy();
  });

  it("filterValues", () => {
    expect(component["filterValues"]("term")).toBeDefined();
  });

  it("filterValues", () => {
    component["filterValues"](null).subscribe(data => expect(data).toEqual([]));
  });

  it("onValueChanges", () => {
    component.searchFailed = true;
    component["onValueChanges"]([]);
    expect(component.searchFailed).toBeTruthy();
  });

  it("onValueChanges", () => {
    component.searchFailed = true;
    component["onValueChanges"]([{} as MICA.SelectableEl]);
    expect(component.searchFailed).toBeFalsy();
  });

  it("filteredItems typeAheadMin", () => {
    const s = {...defaultState};
    spyOnProperty(component, "state", "get").and.returnValue(s);
    component.liveSearchType = "drugByName";
    component.initialState = false;
    component.typeAheadMin = 3;
    const term = "12";
    component["filteredItems"](term);
    expect(component.searching.value).toBe(false);
  });

  it("filteredItems", () => {
    const s = {...defaultState};
    spyOnProperty(component, "state", "get").and.returnValue(s);
    component.liveSearchType = "drugByName";
    component.initialState = false;
    component.typeAheadMin = 1;
    component.ctrl = new FormControl("");
    const term = "123";
    component["filteredItems"](term);
    expect(component.searching.value).toBe(true);
    expect(component["filteredItems"](term)).toBeDefined();
  });

  it("valueExists", () => {
    expect(component["valueExists"](1)).toBeTruthy();
  });

  it("onSelectCtrlChange", () => {
    const setValueSpy = spyOn(component.ctrl, "setValue").and.callThrough();
    component["onSelectCtrlChange"]({});
    expect(setValueSpy).toHaveBeenCalled();
  });

  it("setValueAfterDownload", () => {
    const setValueSpy = spyOn(component.ctrl, "setValue").and.callThrough();
    component.setValueAfterDownload();
    expect(setValueSpy).toHaveBeenCalled();
  });

  it("setSearchFailed", () => {
    component.searchFailed = false;
    component["setSearchFailed"]([]);
    expect(component.searchFailed).toBeTruthy();
  });

  it("withoutExcludedItems", () => {
    spyOn<any>(component, "isExcluded").and.returnValue(false);
    const items = [{}];
    expect(component["withoutExcludedItems"](items).length).toEqual(1);
  });

  it("isExcluded", () => {
    component.excludeItems = ["name"];
    const item = {
        name: "name"
    };
    expect(component["isExcluded"](item)).toBeTruthy();
  });

  it("setOrigin", () => {
    const items = [
      {
        name: "name"
      }
    ];
    const searchType = "drugByName";
    component.liveSearchType = searchType;
    expect(component["setOrigin"](items)[0].origin).toEqual(component.liveSearchType);
  });

  it("sortItemsByKey", () => {
    const items = [
      {
        name: "z"
      },
      {
        name: "a"
      }
    ];
    expect((component["sortItemsByKey"](items)[0] as any).name).toEqual(items[1].name)
  });

  it("handleSearchError", () => {
    component.searchFailed = false;
    component["handleSearchError"]({}).subscribe(
      () => {},
      err => {
        expect(err).toEqual({});
      }
    );
    expect(component.searchFailed).toBeTruthy();
  });

  it("onSearchComplete", () => {
    component.searching.next(true);
    component["onSearchComplete"]();
    expect(component.searching.value).toBeFalsy();
  });

  it("checkTerm", () => {
    expect(component["checkTerm"]("term", {name: "term"})).toBeTruthy();
  });

  it("setOriginToStatic", () => {
    const item = {
      origin: "origin"
    };
    expect(component["setOriginToStatic"](item).origin).toEqual("static");
  });

  it("getItemsStatic", () => {
    const results = [
      {} as SelectableEl
    ];
    component.searchFailed = true;
    component["getItemsStatic"](results).subscribe(res => {
      expect(res.length).toEqual(results.length);
    });
    expect(component.searchFailed).toEqual(false);
  });

  it("setInitialState", () => {
    component.initialState = true;
    component.searchFailed = true;
    component["setInitialState"]();
    expect(component.initialState).toBeFalsy();
    expect(component.searchFailed).toBeFalsy();
  });

  it("getItemsSearch", () => {
    const itemsStatic = of([{}]);
    component["getItemsSearch"](null, itemsStatic).subscribe(items => {
      expect(items.length).toEqual(1);
    })
  });

  it("getItemsSearch", () => {
    const itemsStatic = of([{}]);
    const itemsSearch = of([{}]);
    component["getItemsSearch"](itemsSearch, itemsStatic).subscribe(items => {
      expect(items.length).toEqual(2);
    });
  });

  it("focusLost", () => {
    const closeEmitSpy = spyOn(component.close, "emit").and.callThrough();
    component.canClose = true;
    component.focusLost();
    expect(closeEmitSpy).not.toHaveBeenCalled();
  });

  it("withoutExcludedItems", () => {
    component.removeSelectedValues = false;
    const items = [];
    expect(component["withoutExcludedItems"](items).length).toEqual(0);
  });

  it("optionSelect", () => {
    const selectSpy = spyOn(component.select, "emit");
    component["optionSelect"]("value");
    expect(selectSpy).toHaveBeenCalled();
  });

  it("valueSubFactory", fakeAsync(() => {
    component.ctrl = new FormControl("value");
    const filterSpy = spyOn(component as any, "filterValues").and.callThrough();
    const sub = component["valueSubFactory"];
    component.ctrl.setValue("");
    tick(700);
    expect(filterSpy).toHaveBeenCalledWith("", 0);
    sub.unsubscribe();
  }));

  it("notFound", () => {
    component.selectableItems.next([]);
    component.liveSearchType = null;
    component.ctrl.setValue("88");
    component.searching.next(false);
    component.searchFailed = true;
    expect(component.notFound).toBeTruthy();
  });

});
