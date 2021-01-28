import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDrugSourcesComponent } from './add-drug-sources.component';
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
  let component: AddDrugSourcesComponent;
  let fixture: ComponentFixture<AddDrugSourcesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MicaTestModule,
      ],
      declarations: [ AddDrugSourcesComponent ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        provideMockStore({ initialState: state })
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDrugSourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
