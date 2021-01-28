import {async, ComponentFixture, fakeAsync, TestBed, tick} from "@angular/core/testing";

import { EditInputValueComponent } from './edit-input-value.component';
import {NgRedux} from "@angular-redux/store";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {defaultState} from "../../../../app.config";
import {Observable} from "rxjs";
import {of} from "rxjs/observable/of";

const mockRedux = {
  getState: () => {
    return defaultState
  },
  select: (selector) => of(selector(defaultState)),
  dispatch: (arg: any) => {}
};

describe('EditInputValueComponent', () => {
  let component: EditInputValueComponent;
  let fixture: ComponentFixture<EditInputValueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditInputValueComponent ],
      providers: [
        { provide: NgRedux, useValue: mockRedux }
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditInputValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should write value', () => {
    component.ctrl = new FormControl("");
    component.writeValue("Value");
    expect(component.ctrl.value).toEqual("Value");
  });
  it('should set validator on init', fakeAsync(() => {
    const validator = (control) => {};
    component.ctrl = new FormControl("");
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

  it("should call propagateChange", () =>  {
    const valueSub = component.ctrl.valueChanges;
    component.ctrl.setValue("");
    const propagateChange = spyOn(component, "propagateChange").and.callThrough()
    valueSub.subscribe(v => {
      expect(propagateChange).toHaveBeenCalledWith(v);
    })
  });

  it("writeValue", () => {
    expect(component.writeValue(undefined)).toBeUndefined();
  });

});
