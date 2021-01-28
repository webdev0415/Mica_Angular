import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as _ from 'lodash';

import { RecordSelectorComponent } from './record-selector.component';
import { TreatmentsModule } from '../../treatments.module';
import { TreatmentsApiService } from '../../services/treatments-api.service';
import { TreatmentApiServiceStub } from '../../../../../test/services-stubs/treatment-api-service-stub.service';
import { IllnessService } from '../../../../services';
import { IllnessServiceStub } from '../../../../../test/services-stubs/illness.service.stub';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { defaultState } from '../../../../app.config';
import { StoreModule } from '@ngrx/store';
import { NgRedux } from '@angular-redux/store';
import { Actions, EffectsModule } from '@ngrx/effects';

describe('RecordSelectorComponent', () => {
  let component: RecordSelectorComponent;
  let fixture: ComponentFixture<RecordSelectorComponent>;
  let store: MockStore<State.Root>;

  const state = _.cloneDeep(defaultState);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        NgRedux,
        provideMockStore({ initialState: state }),
        { provide: TreatmentsApiService, useClass: TreatmentApiServiceStub },
        { provide: IllnessService, useClass: IllnessServiceStub },
        Actions
      ],
      imports: [
        TreatmentsModule,
        StoreModule.forRoot([]),
        EffectsModule.forRoot()
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordSelectorComponent);
    component = fixture.componentInstance;
    store = TestBed.get(MockStore);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('onRecordChange', () => {
    const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();

    component.onRecordChange(<any>{});
    expect(dispatchSpy).toHaveBeenCalled();
  });
});
