import { TestBed } from '@angular/core/testing';

import { ByDrugEffects } from './by-drug.effects.';
import { TreatmentsApiService } from '../../../services/treatments-api.service';
import { TreatmentApiServiceStub } from '../../../../../../test/services-stubs/treatment-api-service-stub.service';
import { Actions } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { IllnessService } from '../../../../../services';
import * as _ from 'lodash';
import { defaultState } from '../../../../../app.config';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgRedux } from '@angular-redux/store';

const state = _.cloneDeep(defaultState);
const mockRedux = {
  getState: () => {
    return state;
  },
  dispatch: (arg: any) => {
  }
};

describe('ByDrugEffects', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      Actions,
      IllnessService,
      TreatmentsApiService,
      { provide: TreatmentsApiService, useClass: TreatmentApiServiceStub },
      { provide: NgRedux, useValue: mockRedux }
    ],
    imports: [
      StoreModule.forRoot({}),
      HttpClientTestingModule
    ]
  }));

  it('should be created', () => {
    const service: ByDrugEffects = TestBed.get(ByDrugEffects);
    expect(service).toBeTruthy();
  });
});
