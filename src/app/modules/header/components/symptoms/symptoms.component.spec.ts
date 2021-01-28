import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SymptomsComponent } from './symptoms.component';
import {MockNgRedux, NgReduxTestingModule} from "@angular-redux/store/testing";
import {NgRedux, NgReduxModule} from "@angular-redux/store";
import {defaultState, navInit} from "../../../../app.config";
import {RouterTestingModule} from "@angular/router/testing";
import {testRoutes} from "../../../../../test/data/test-routes";
import Expected = jasmine.Expected;
import {TestComponent} from "../../../../../test/test.component";
import {Observable} from "rxjs";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {of} from "rxjs/observable/of";
import {CorrectSpellingPipe} from "../../../pipes/correct-spelling.pipe";
const fakeIllnesses: Illness.Normalized.IllnessValue[] = require('./../../../../../test/data/illnesses.json');

describe('SymptomsComponent', () => {
  let component: SymptomsComponent;
  let fixture: ComponentFixture<SymptomsComponent>;
  const mockRedux = {
    getState: (): State.Root => {
      return defaultState
    },
    dispatch: (arg: any) => {}
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SymptomsComponent,
        TestComponent,
        CorrectSpellingPipe
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        { provide: NgReduxModule, useClass: NgReduxTestingModule}
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes(testRoutes)
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SymptomsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('state getter should return actual state', () => {
    expect(component['state']).toEqual(defaultState);
  });

  it('state getter should return actual state', () => {
    spyOnProperty(component, 'activeIllnessValue', 'get').and.returnValue(of(fakeIllnesses[0]));
    component.isComplete('Measurements').subscribe(res => {
      expect(res).toEqual(true);
    })
  });

  it('state getter should return actual state', () => {
    spyOnProperty(component, 'activeIllnessValue', 'get').and.returnValue(of(null));
    component.isComplete('Measurements').subscribe(res => {
      expect(res).toEqual(false);
    })
  });
});
