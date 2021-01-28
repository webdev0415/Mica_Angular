import {async, ComponentFixture, fakeAsync, TestBed, tick} from "@angular/core/testing";
// import { PipesModule } from "../pipes/pipes.module";

import { InputArrayValueEditComponent } from "./input-array-value-edit.component";
import {NgRedux} from "@angular-redux/store";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {defaultState} from "../../../../app.config";
import {Observable} from "rxjs";
import {of} from "rxjs/observable/of";
import { PipesModule } from "app/modules/pipes/pipes.module";
import { CommonModule } from "@angular/common";
import { Input, Component } from "@angular/core";

const mockRedux = {
  getState: () => {
    return defaultState
  },
  select: (selector) => of(selector(defaultState)),
  dispatch: (arg: any) => {}
};

@Component({
  selector: "mica-typeahead",
  template: "<div></div>"
})
class MockTypeaheadComponent {
  @Input() typeAheadMin = 3;
  @Input() placeholder = "";
  @Input() liveSearchType: MICA.LiveSearchType;
  @Input() icd10CodeSearch: boolean;
  @Input() sortByKey: string;
}

describe("InputArrayValueEditComponent", () => {
  let component: InputArrayValueEditComponent;
  let fixture: ComponentFixture<InputArrayValueEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        InputArrayValueEditComponent,
        MockTypeaheadComponent
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux }
      ],
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PipesModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputArrayValueEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("should write value", () => {
    component.ctrl = new FormControl([]);
    component.writeValue([1]);
    expect(component.ctrl.value).toEqual([1]);
    component.writeValue(null);
    expect(component.ctrl.value).toEqual([1]);
  });

  it("should set validator on init", fakeAsync(() => {
    const validator = (control) => {};
    component.ctrl = new FormControl([]);
    component.validator = validator;
    const setValidators = spyOn(component.ctrl, "setValidators").and.callThrough();
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    expect(setValidators).toHaveBeenCalledWith([validator]);
  }));

  it("should set propagateChange", () =>  {
    const propagateChange = (_: any) => {return {}};
    component.registerOnChange(propagateChange);
    expect(component.propagateChange).toEqual(propagateChange);
  });

  it("should call registerOnTouched", () =>  {
    const res = component.registerOnTouched();
    expect(res).toBeUndefined();
  });

  it("should call propagateChange", fakeAsync(() =>  {
    const valueSub = component.ctrl.valueChanges;
    component.ctrl.setValue([""]);
    const propagateChange = spyOn(component, "propagateChange").and.callThrough()
    valueSub.first().subscribe(v => {
      expect(propagateChange).toHaveBeenCalledWith(v);
    })
  }));

  it("toggleMode", () => {
    component.toggleMode();
    expect(component.showInput).toBe(true);
    component.toggleMode();
    expect(component.showInput).toBe(false);
  })

  it ("addItem / removeItem", () => {
    const toggleModeSpy = spyOn(component, "toggleMode").and.callThrough();
    component.addItem("code");
    expect(component.ctrl.value).toEqual(["code"]);
    component.addItem("");
    expect(component.ctrl.value).toEqual(["code"]);
    expect(toggleModeSpy).toHaveBeenCalledTimes(2);
    component.removeItem(0);
    expect(component.ctrl.value).toEqual([]);
  })
});
