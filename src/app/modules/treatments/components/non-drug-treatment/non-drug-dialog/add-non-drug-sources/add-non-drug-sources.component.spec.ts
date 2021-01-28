import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNonDrugSourcesComponent } from './add-non-drug-sources.component';
import { MicaTestModule } from '../../../../../../../test/mica-test.module';
import * as _ from 'lodash';
import { defaultState } from '../../../../../../app.config';
import { NgRedux } from '@angular-redux/store';
import { provideMockStore } from '@ngrx/store/testing';

const state = _.cloneDeep(defaultState);
const mockRedux = {
  getState: () => state,
  dispatch: () => {
  }
};

describe('AddNonDrugSourcesComponent', () => {
  let component: AddNonDrugSourcesComponent;
  let fixture: ComponentFixture<AddNonDrugSourcesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MicaTestModule,
      ],
      declarations: [ AddNonDrugSourcesComponent ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        provideMockStore({ initialState: state })
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNonDrugSourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
