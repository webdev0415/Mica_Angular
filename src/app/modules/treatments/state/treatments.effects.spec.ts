import { TestBed } from '@angular/core/testing';

import { TreatmentsEffects } from './treatments.effects';
import { TreatmentsApiService } from '../services/treatments-api.service';
import { Actions, EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TreatmentApiServiceStub } from '../../../../test/services-stubs/treatment-api-service-stub.service';
import { IllnessService } from '../../../services';
import { IllnessServiceStub } from '../../../../test/services-stubs/illness.service.stub';

describe('TreatmentsEffects', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: TreatmentsApiService, useClass: TreatmentApiServiceStub },
        { provide: IllnessService, useClass: IllnessServiceStub },
        Actions
      ],
      imports: [
        StoreModule.forRoot({}),
        EffectsModule.forRoot(),
      ]
    });
  });

  it('should be created', () => {
    const service: TreatmentsEffects = TestBed.get(TreatmentsEffects);
    expect(service).toBeTruthy();
  });
});
