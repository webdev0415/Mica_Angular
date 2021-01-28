import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { CopyComponent } from './copy.component';
import { TreatmentsModule } from '../../treatments.module';
import { TreatmentsApiService } from '../../services/treatments-api.service';
import { TreatmentApiServiceStub } from '../../../../../test/services-stubs/treatment-api-service-stub.service';
import { defaultState, treatmentsInit } from '../../../../app.config';
import Search = Treatments.Search;
import { of } from 'rxjs/observable/of';
import New = Treatments.Record.New;
import { IllnessService } from '../../../../services';
import { IllnessServiceStub } from '../../../../../test/services-stubs/illness.service.stub';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { StoreModule } from '@ngrx/store';
import { Actions, EffectsModule } from '@ngrx/effects';
import { NgRedux } from '@angular-redux/store';

const mockRedux = {
  getState: () => {
    return {
      treatments: treatmentsInit
    }
  },
  dispatch: (arg: any) => {}
};

describe('CopyComponent', () => {
  let component: CopyComponent;
  let fixture: ComponentFixture<CopyComponent>;
  let store: MockStore<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({ initialState: defaultState }),
        { provide: NgRedux, useValue: mockRedux },
        { provide: TreatmentsApiService, useClass: TreatmentApiServiceStub },
        { provide: IllnessService, useClass: IllnessServiceStub },
        Actions,
      ],
      imports: [
        TreatmentsModule,
        StoreModule.forRoot({}),
        EffectsModule.forRoot()
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyComponent);
    store = TestBed.get(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('onRecordChange', () => {
    const record = {
      treatments: ['17']
    } as any;
    const search = {
      record: record
    } as Search;

    component.onRecordChange(search);
    expect(component.searchRecord).toEqual(record);
  });

  it('onRecordChange', () => {
    component.onRecordChange({ record: null } as Search);
    expect(component.searchRecord).toBeUndefined();
  });

  it('ngOnInit', fakeAsync(() => {
    const record = { icd10Code: 'code' };
    let res;

    (<any>component).newRecord = of(record);
    component.ngOnInit();
    component.newRecordName.subscribe(val => res = val);
    tick();
    expect(res).toEqual(record.icd10Code);
  }));

  it('ngOnInit', fakeAsync(() => {
    const record = { symptomID: 'id' };
    let res;

    (<any>component).newRecord = of(record);
    component.ngOnInit();
    component.newRecordName.subscribe(val => res = val);
    tick();
    expect(res).toEqual(record.symptomID);
  }));

  it('ngOnInit', fakeAsync(() => {
    const record = {};
    let res;

    (<any>component).newRecord = of(record);
    component.ngOnInit();
    component.newRecordName.subscribe(val => res = val);
    tick();
    expect(res).toEqual('');
  }));

  it('onConfirmMerge', fakeAsync(() => {
    const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();
    const emitSpy = spyOn(component.close, 'emit').and.callThrough();
    const currentRecord: any = {
      isNew: true,
      record: {
        idIcd10Code: 'someCode',
        symptomID: 'someID'
      }
    };

    (<any>component).currentRecord = of(currentRecord);
    component.searchRecord = {
      treatments: []
    } as New;
    component.onConfirmMerge();
    tick();
    expect(dispatchSpy).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith(true);
  }));

});
