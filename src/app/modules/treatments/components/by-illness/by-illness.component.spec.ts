import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NgRedux } from '@angular-redux/store';
import * as _ from 'lodash';
import { of } from 'rxjs/internal/observable/of';

import { defaultState } from 'app/app.config';
import { IllnessService, SourceService } from 'app/services';
import * as symptomsSelectors from 'app/state/symptoms/symptoms.selectors';
import * as illnessesSelectors from 'app/state/illnesses/illnesses.selectors';
import * as sourcesActions from 'app/state/source/source.actions';
import { ByIllnessComponent } from './by-illness.component';
import { TreatmentsModule } from '../../treatments.module';
import { TreatmentsApiService } from '../../services/treatments-api.service';
import { TreatmentApiServiceStub } from '../../../../../test/services-stubs/treatment-api-service-stub.service';
import { IllnessServiceStub } from '../../../../../test/services-stubs/illness.service.stub';

import New = Treatments.Record.New;
import Template = Treatments.Types.Template;
import { SourceServiceStub } from '../../../../../test/services-stubs/source.service.stub';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { StoreModule } from '@ngrx/store';
import { Actions, EffectsModule } from '@ngrx/effects';

const state = _.cloneDeep(defaultState);

const mockRedux = {
  getState: () => {
    return state
  },
  dispatch: (arg: any) => {
  }
};

describe('ByIllnessComponent', () => {
  let component: ByIllnessComponent;
  let fixture: ComponentFixture<ByIllnessComponent>;
  let treatmentService: TreatmentApiServiceStub;
  let sourceService: SourceServiceStub;
  let redux: NgRedux<State.Root>;
  let store: MockStore<State.Root>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({ initialState: state }),
        { provide: NgRedux, useValue: mockRedux },
        { provide: TreatmentsApiService, useClass: TreatmentApiServiceStub },
        { provide: IllnessService, useClass: IllnessServiceStub },
        { provide: SourceService, useClass: SourceServiceStub },
        Actions
      ],
      imports: [
        TreatmentsModule,
        StoreModule.forRoot({}),
        EffectsModule.forRoot(),
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    treatmentService = TestBed.get(TreatmentsApiService);
    sourceService = TestBed.get(SourceService);
    redux = TestBed.get(NgRedux);
    store = TestBed.get(MockStore);
    fixture = TestBed.createComponent(ByIllnessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('get postAction', fakeAsync(() => {
    const newRecord = {
      isNew: true,
      record: {
        idIcd10Code: 'someCode',
        symptomID: 'someID'
      }
    };
    let res = '';

    component.postAction.toPromise().then(action => {
      res = action;
    });
    tick();
    expect(res).toEqual('');

    component.currentRecord$ = of(<any>newRecord);

    component.postAction.toPromise().then(action => {
      res = action;
    });
    tick();
    expect(res).toContain(newRecord.record.symptomID);

    newRecord.isNew = false;
    component.postAction.toPromise().then(action => {
      res = action;
    });
    tick();
    expect(res).toContain('SAVE');
    newRecord.record = null;
  }));

  it('trackTable', () => {
    const table = { typeID: 17 } as Template;
    expect(component.trackTable(0, table)).toEqual(17);
  });

  it('onCancel', () => {
    const mockDispatch = spyOn(store, 'dispatch').and.callThrough();

    component.onCancel();
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('onTreatmentChange', () => {
    const spySaveRecord = spyOn<any>(component, 'saveRecord').and.callFake(() => {});

    component.onTreatmentChange('msg');
    expect(spySaveRecord).toHaveBeenCalled();
  });

  it('processNewRecord A', () => {
    expect(component['processNewRecord'](null)).toEqual('');
  });

  it('processNewRecord B', () => {
    const symptomId = '17';
    const symptomName = 'name';
    const record = { symptomID: symptomId } as New;
    const s = { ...state };

    Object.assign(s, { symptoms: { entities: { symptoms: { [symptomId]: { name: symptomName } } } } });
    spyOnProperty(component, 'state', 'get').and.returnValue(s);
    expect(component['processNewRecord'](record)).toEqual(`${symptomId} - ${symptomName}`);
  });

  it('processNewRecord C', () => {
    const symptomName = 'name';
    const record = { symptomID: null } as New;
    const s = { ...state };

    Object.assign(s, { symptoms: { entities: { symptoms: { '18': { name: symptomName } } } } });
    spyOnProperty(component, 'state', 'get').and.returnValue(s);
    expect(component['processNewRecord'](record)).toEqual('');
  });

  it('valueExists', () => {
    expect(component['valueExists'](1)).toBeTruthy();
  });

  it('processNewRecord D', () => {
    const record = {
      symptomID: 'id',
      icd10Code: 'A'
    } as any;
    spyOn(symptomsSelectors, 'symptomData').and.returnValue(() => {
      return { name: '' }
    });
    expect(component['processNewRecord'](record).includes(record.symptomID)).toBeTruthy();
  });

  it('processNewRecord E', () => {
    const record = {
      icd10Code: 'A'
    } as any;
    spyOn(illnessesSelectors, 'illnessByIcd10Code').and.returnValue(() => {
      return { name: '' }
    });
    expect(component['processNewRecord'](record)).toEqual(record.icd10Code);
  });

  it('processNewRecord F', () => {
    const record = {
      icd10Code: 'A'
    } as any;
    spyOn(illnessesSelectors, 'illnessByIcd10Code').and.returnValue(() => {
      return { name: 'name' }
    });
    expect(component['processNewRecord'](record).includes(record.icd10Code)).toBeTruthy();
  });

  it('isDrugTab', () => {
    component.activeTabName = 'OTC Drugs';
    expect(component.isDrugTab).toEqual(true);

    component.activeTabName = 'Prescription Drugs';
    expect(component.isDrugTab).toEqual(true);

    component.activeTabName = 'Some Tab';
    expect(component.isDrugTab).toEqual(false);
  });

  it('onTreatmentChange', () => {
    const saveRecordSpy = spyOn(<any>component, 'saveRecord').and.callFake(() => {});

    component.onTreatmentChange('msg');
    expect(saveRecordSpy).toHaveBeenCalledWith('msg');
  });

  it('setActive', () => {
    const tpl = { name: 'test' };

    (<any>component).setActive(<any>tpl);
    expect(component.activeTabName).toEqual(tpl.name);
    expect(component.activeTreatmentTemplate).toEqual(<any>tpl);

    (<any>component).setActive(null);
    expect(component.activeTabName).toEqual(tpl.name);
    expect(component.activeTreatmentTemplate).toEqual(<any>tpl);
  });

  it('getGroupsForTemplate', fakeAsync(() => {
    const treatment = { name: 'test', groups: [ 'testGroup' ] };
    const currentRecord = { record: { treatments: [ treatment ] } };
    let res;

    component.currentRecord$ = of(null);
    component.getGroupsForTemplate('test').toPromise().then(groups => {
      res = groups;
    });
    tick();
    expect(res).toEqual([]);

    component.currentRecord$ = of(<any>currentRecord);
    component.getGroupsForTemplate('test').toPromise().then(groups => {
      res = groups;
    });
    tick();
    expect(res).toEqual(<any>treatment.groups);
  }));

  it('saveRecord', fakeAsync(() => {
    const saveRecordSpy = spyOn(treatmentService, 'saveRecord').and.returnValue(of());
    const group = { drugs: [ { sourceInfo: [] } ], nonDrugs: undefined };
    const treatmentRecord = { record: { treatments: [ { groups: [ group ] } ] }};

    component.currentRecord$ = of(<any>treatmentRecord);

    (<any>component).saveRecord();
    tick();
    expect(saveRecordSpy.calls.mostRecent().args[0].treatments[0].groups[0].drugs.length).toEqual(0);

    group.drugs = [ { sourceInfo: [ { sourceID: 2 } ] } ];
    (<any>component).saveRecord();
    tick();
    expect(saveRecordSpy.calls.mostRecent().args[0].treatments[0].groups[0].drugs.length).toEqual(1);

    group.drugs = undefined;

    group.nonDrugs = [ { sourceInfo: [] } ];
    (<any>component).saveRecord();
    tick();
    expect(saveRecordSpy.calls.mostRecent().args[0].treatments[0].groups[0].nonDrugs.length).toEqual(0);

    group.nonDrugs = [ { sourceInfo: [ { sourceID: 2 } ] } ];
    (<any>component).saveRecord();
    tick();
    expect(saveRecordSpy.calls.mostRecent().args[0].treatments[0].groups[0].nonDrugs.length).toEqual(1);

    group.nonDrugs = undefined;
    (<any>component).saveRecord();
    tick();
    expect(saveRecordSpy.calls.mostRecent().args[0].treatments[0].groups[0].nonDrugs).toBeFalsy();
    expect(saveRecordSpy.calls.mostRecent().args[0].treatments[0].groups[0].drugs).toBeFalsy();

    treatmentRecord.record = undefined;
    saveRecordSpy.calls.reset();
    (<any>component).saveRecord();
    tick();
    expect(saveRecordSpy).not.toHaveBeenCalled();
  }));

  it('loadSourcesForTemplate', fakeAsync(() => {
    const loadTreatmentSourcesSpy = spyOn(sourcesActions, 'loadTreatmentSources').and.returnValue(of([]));
    const dispatch = spyOn(store, 'dispatch').and.returnValue(of([]));

    (<any>component).loadSourcesForTemplate('code', 'SYMPTOM');
    tick();
    expect(loadTreatmentSourcesSpy).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalled();
  }));

});
