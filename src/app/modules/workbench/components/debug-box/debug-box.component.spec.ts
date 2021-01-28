import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugBoxComponent } from './debug-box.component';
import {ValueSwitchComponent} from "../../../gui-widgets/components/value-switch/value-switch.component";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgRedux, NgReduxModule} from "@angular-redux/store";
import {NgReduxTestingModule} from "@angular-redux/store/testing";
import {defaultState, navInit} from "../../../../app.config";
import SymptomGroup = Illness.Normalized.SymptomGroup;
import {of} from "rxjs/observable/of";
import * as symptomsSelectors from "../../../../state/symptoms/symptoms.selectors";
const fakeUsers = require("../../../../../test/data/users.json");

const mockRedux = {
  getState: () => {
    return {
      user: fakeUsers[0],
      nav: navInit
    }
  },
  dispatch: (arg: any) => {}
};

describe('DebugBoxComponent', () => {
  let component: DebugBoxComponent;
  let fixture: ComponentFixture<DebugBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DebugBoxComponent,
        ValueSwitchComponent
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        { provide: NgReduxModule, useClass: NgReduxTestingModule },
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DebugBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it("debugObject", () => {
    component.entity = new FormControl("");
    expect(component.debugObject).toBeDefined();
  });

  it("title", () => {
    component.entity = new FormControl("");
    spyOnProperty(component, "symptomGroup", "get").and.returnValue(of(null));
    spyOn(symptomsSelectors, "activeSymptomGroupData").and.returnValue("");
    component.title.subscribe(val => {
      expect(val).toBeDefined();
    });
  });

  it("title", () => {
    component.entity = new FormControl("");
    spyOnProperty(component, "symptomGroup", "get").and.returnValue(of({}));
    component.title.subscribe(val => {
      expect(val).toBeDefined();
    });
  });

  it("shouldShow", () => {
    const s = {...defaultState};
    Object.assign(s, {user: {email: "shelbymita@gmail.com"}});
    spyOnProperty<any>(component, "state", "get").and.returnValue(s);
    component.isProduction = true;
    expect(component.shouldShow).toEqual(true);
  });
});
