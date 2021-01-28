import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import * as _ from 'lodash';

import { TreatmentsApiService } from './treatments-api.service';
import { NgRedux } from '@angular-redux/store';
import { defaultState } from 'app/app.config';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

const state = _.cloneDeep(defaultState);
const mockRedux = {
  getState: () => state,
  dispatch: () => {
  }
};

describe('TreatmentsApiService', () => {
  let service: TreatmentsApiService;
  let mockBackend: HttpTestingController;
  let redux: NgRedux<State.Root>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TreatmentsApiService,
        { provide: NgRedux, useValue: mockRedux }
      ],
      imports: [
        HttpClientTestingModule
      ]
    });
    mockBackend = TestBed.get(HttpTestingController);
    service = TestBed.get(TreatmentsApiService);
    redux = TestBed.get(NgRedux);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getRecordFor', fakeAsync(() => {
    const record = {
      treatments: [],
      icd10Code: 'ICD10',
      symptomID: undefined
    };
    let res;

    service.getRecordFor('any').subscribe(data => res = data);
    tick();
    mockBackend.expectOne(() => true).flush(record);
    expect(res).toEqual(record);
  }));

  it('createTreatmentType', () => {
    const payload = {
      name: 'name',
      treatmentTypeDesc: []
    };
    const resp = { status: 'OK' };

    service.createTreatmentType(payload).subscribe(res => {
      expect(res).toEqual(resp);
    });
    mockBackend.expectOne(() => true).flush(resp);
  });

  it('loadTreatmentTypes', () => {
    const treatmentType = {
      shortName: 'short1',
      longName: 'long',
      typeDescID: 1,
      defaultValue: true
    };
    const treatmentTemplate = {
      name: 'name',
      typeID: 1,
      treatmentTypeDesc: [{ ...treatmentType, shortName: 'short2' }, treatmentType]
    };
    const treatmentTypes = [treatmentTemplate];

    service.loadTreatmentTypes().subscribe(({ treatmentTypes: res }) => {
      expect(res[0].treatmentTypeDesc[1].shortName).toEqual(treatmentType.shortName);
    });
    mockBackend.expectOne(() => true).flush({ treatmentTypes });
  });

  it('getRecordFor', () => {
    expect(service.getRecordFor('SYMPT')).toBeDefined();
  });
});
