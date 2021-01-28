import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import * as _ from 'lodash';

import { TreatmentsSearchComponent } from './search.component';
import { TreatmentsModule } from '../../treatments.module';
import { NgRedux } from '@angular-redux/store';
import { TreatmentsApiService } from '../../services/treatments-api.service';
import { TreatmentApiServiceStub } from '../../../../../test/services-stubs/treatment-api-service-stub.service';
import { defaultState } from 'app/app.config';
import { BehaviorSubject, throwError } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { FormControl } from '@angular/forms';
import { IllnessService } from 'app/services';
import { IllnessServiceStub } from '../../../../../test/services-stubs/illness.service.stub';
import { provideMockStore } from '@ngrx/store/testing';
import { StoreModule } from '@ngrx/store';
import { Actions, EffectsModule } from '@ngrx/effects';
const fakeSymptoms = require('../../../../../test/data/symptoms.json');
const state = _.cloneDeep(defaultState);

const mockRedux = {
  getState: () => {
    return state
  },
  dispatch: (arg: any) => {
  }
};

describe('TreatmentsSearchComponent', () => {
  let component: TreatmentsSearchComponent;
  let fixture: ComponentFixture<TreatmentsSearchComponent>;
  let treatmentService: TreatmentApiServiceStub;
  let redux: NgRedux<State.Root>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({ initialState: state }),
        { provide: NgRedux, useValue: mockRedux },
        { provide: TreatmentsApiService, useClass: TreatmentApiServiceStub },
        { provide: IllnessService, useClass: IllnessServiceStub },
        Actions
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
    redux = TestBed.get(NgRedux);
    treatmentService = TestBed.get(TreatmentsApiService);
    fixture = TestBed.createComponent(TreatmentsSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    component.ngOnDestroy();
  });

  it('onClose', () => {
    component.searchCtrl.setValue('test');
    component.searchTryIllness = true;
    component.onClose();
    expect(component.searchCtrl.value).toBe('');
    expect(component.searchTryIllness).toBeFalsy();
    expect(component.focusOnSearch).toBeTruthy();
  });

  it('get _searchSub should return empty array when no such sympt', fakeAsync(() => {
    const search = 'search';

    component.searchCtrl.setValue(search);
    tick(100);
    expect(component.searchResults.value).toEqual([]);
  }));

  it('get _searchSub when find something', fakeAsync(() => {
    const symptom = fakeSymptoms[0];
    const search = symptom.symptomID;

    (state.symptoms.entities as any).symptoms[symptom.symptomID] = symptom;
    component.searchCtrl.setValue(search.substring(0, 4));
    tick(100);
    expect(component.searchResults.value).toEqual([{name: symptom.name, value: symptom.symptomID}]);
  }));

  it('get _searchSub when emty search term passed', fakeAsync(() => {
    const symptom = fakeSymptoms[0];
    const search = '';

    (state.symptoms.entities as any).symptoms[symptom.symptomID] = symptom;
    component.searchCtrl.setValue(search);
    tick(100);
    expect(component.searchResults.value).toEqual([]);
  }));

  it('ngOnInit', fakeAsync(() => {
    component.searchCtrl = new FormControl('');
    const setValueSpy = spyOn(component.searchCtrl, 'setValue').and.callThrough();

    component.selector = true;

    (<any>component).currentRecord = of({ record: null });
    component.ngOnInit();
    tick();
    expect(setValueSpy).not.toHaveBeenCalled();
  }));

  it('ngOnInit', fakeAsync(() => {
    component.searchCtrl = new FormControl('');
    const setValueSpy = spyOn(component.searchCtrl, 'setValue').and.callThrough();

    component.selector = true;

    (<any>component).currentRecord = of({ record: {} });
    component.ngOnInit();
    tick();
    expect(setValueSpy).toHaveBeenCalled();
  }));

  it('ngOnDestroy', () => {
    const sub = of({}).subscribe();
    component['subs'].push(sub);
    const unsubSpy = spyOn(sub, 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(unsubSpy).toHaveBeenCalled();
  });

  it('handleClick', () => {
    const parentNode = document.createElement('div');
    const targetElem = document.createElement('div');
    parentNode.appendChild(targetElem);
    const ev = {
      target: targetElem
    };
    component.inputRef = {nativeElement: parentNode};
    component.ulRef = {nativeElement: parentNode};
    component.focusOnSearch = true;
    component.handleClick(ev);
    expect(component.focusOnSearch).toBeTruthy();
  });

  it('handleClick', () => {
    const parentNode = document.createElement('div');
    const targetElem = document.createElement('div');
    parentNode.appendChild(targetElem);
    const ev = {
      target: targetElem
    };
    component.inputRef = {nativeElement: parentNode};
    component.ulRef = {nativeElement: targetElem};
    component.focusOnSearch = true;
    component.handleClick(ev);
    expect(component.focusOnSearch).toBeFalsy();
  });

  it('setSearchResults', () => {
    const nextSpy = spyOn(component.searchResults, 'next').and.callThrough();
    const isSymptom = true;
    const errorThrown = true;
    const illnesses: any = [];
    component['setSearchResults'](isSymptom, errorThrown, [], illnesses);
    expect(nextSpy).toHaveBeenCalledWith([]);
  });

  it('setSearchResults', () => {
    const nextSpy = spyOn(component.searchResults, 'next').and.callThrough();
    const isSymptom = true;
    const errorThrown = false;
    const illnesses = [
      {
        name: 'name',
        description: 'description'
      }
    ];
    component['setSearchResults'](isSymptom, errorThrown, [], illnesses);
    expect(nextSpy).not.toHaveBeenCalledWith([]);
  });

  it('addIllnesses', () => {
    const illness = {
      description: 'desc',
      name: 'name'
    };
    const childNodes = [illness];
    const foundIllnesses = [
      {
        ...illness,
        childNodes: childNodes
      }
    ];
    const illnesses: any = [];
    component['addIllnesses'](foundIllnesses, illnesses);
    expect(illnesses.length).toEqual(2);
  });

  it('onSearchByIcon with one result', () => {
    const onSearchSyp = spyOn(component, 'onSearch').and.callFake(() => {});
    component['searchResults'] = new BehaviorSubject([{ name: 'one', groupID: 1} as any]);

    component['onSearchByIcon']();
    expect(component['searchResults'].getValue().length).toBeTruthy();
    expect(onSearchSyp).toHaveBeenCalled();
  });

  it('onSearchByIcon after clickOut', () => {
    const term = 'one';
    const searchResults: any = [{ name: 'one', groupID: 1 }, { name: 'two', groupID: 2 }];
    const onSearchSyp = spyOn(component, 'onSearch').and.callFake(() => {});
    component['searchResults'] = new BehaviorSubject(searchResults);
    component.searchCtrl.setValue(term);

    component['onSearchByIcon']();
    expect(onSearchSyp).not.toHaveBeenCalled();
  });

  it('onSearchByIcon withOut result', () => {
    const onSearchSyp = spyOn(component, 'onSearch').and.callFake(() => {});
    component['searchResults'] = new BehaviorSubject([]);

    component['onSearchByIcon']();
    expect(component['searchResults'].getValue().length).toBeFalsy();
    expect(onSearchSyp).not.toHaveBeenCalled();
  });

  it('onSearch', fakeAsync(() => {
    const record = {
      icd10Code: undefined,
      symptomID: 'ID',
      name: 'name'
    };

    let res: Treatments.Search = {
      new: null,
      record: null
    };
    let value;
    const searchResults: MICA.SelectableEl[] = [{ name: 'Patient Fever', value: 'SYMPT0000223' }];
    const mockGetRecordFor = spyOn(treatmentService, 'getRecordFor');

    component['searchResults'] = new BehaviorSubject(searchResults);

    component.record.subscribe(val => res = val);

    mockGetRecordFor.and.returnValue(of(record));
    value = 'VAL';
    component.onSearch(value);
    tick();
    expect(component.searchCtrl.value).toEqual('');

    mockGetRecordFor.and.returnValue(of(record));
    value = 'Patient Fever';
    component.onSearch(value);
    tick();
    expect(component.searchResults.value.length).toBeTruthy();
  }));

  it('onSearch with 500', fakeAsync(() => {
    const error = {
      status: 500,
      message: 'error message'
    };

    spyOn(component['treatmentSvc'], 'getRecordFor').and.returnValue(throwError(error));
    component.searchResults.next([{ name: 'SYMPT', value: 'SYMPT' }]);
    expect(() => {
      component.onSearch('sympt');
      tick();
    }).toThrow();
    expect(component.hasBackendError).toEqual(true);
  }));

});
