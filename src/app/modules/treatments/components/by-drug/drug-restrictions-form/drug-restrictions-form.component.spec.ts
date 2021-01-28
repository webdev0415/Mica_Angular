import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrugRestrictionsFormComponent } from './drug-restrictions-form.component';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MockSourceFormComponent } from '../../../../../../test/components-stubs';
import * as _ from 'lodash';
import { defaultState } from '../../../../../app.config';
import { NgRedux } from '@angular-redux/store';
import { provideMockStore } from '@ngrx/store/testing';

@Component({
  selector: 'mica-illness-search',
  template: '<div></div>'
})
class MicaIllnessSearchComponent {
  @Input() searchResults: any[];
  @Input() showIllnessGroupToggle = false;
  @Input() combineWithSymptoms = false;

  @Output() searchIllness: EventEmitter<string> = new EventEmitter();

  @Output() selectIllness: EventEmitter<string> = new EventEmitter();
  @Output() selectSymptom: EventEmitter<string> = new EventEmitter();
}

@Component({
  selector: 'mica-drug-likelihood',
  template: '<div></div>'
})
class MicaDrugLikelihoodComponent {
  @Input() likelihoodCtrl: FormControl;
}

const state = _.cloneDeep(defaultState);
const mockRedux = {
  getState: () => {
    return state;
  },
  dispatch: (arg: any) => {
  }
};

describe('DrugRestrictionsFormComponent', () => {
  let component: DrugRestrictionsFormComponent;
  let fixture: ComponentFixture<DrugRestrictionsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DrugRestrictionsFormComponent,
        MicaIllnessSearchComponent,
        MicaDrugLikelihoodComponent,
        MockSourceFormComponent
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        provideMockStore({ initialState: state }),
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrugRestrictionsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
