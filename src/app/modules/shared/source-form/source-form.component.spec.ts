import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { SourceFormComponent } from './source-form.component';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SourceService } from '../../../services';
import { NgRedux } from '@angular-redux/store';
import { defaultState } from '../../../app.config';
import { SourceServiceStub } from '../../../../test/services-stubs/source.service.stub';
import { EventEmitter } from '@angular/core';
import { SourceRemovalModalComponent } from './source-removal-modal/source-removal-modal.component';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { PipesModule } from '../../pipes/pipes.module';
import { MatAutocompleteModule, MatFormFieldModule } from '@angular/material';

const state = { ...defaultState };
const mockRedux = {
  getState: () => state,
  dispatch: () => {
  }
};

describe('SourceFormComponent', () => {
  const fb: FormBuilder = new FormBuilder();
  let component: SourceFormComponent;
  let fixture: ComponentFixture<SourceFormComponent>;
  let redux: NgRedux<State.Root>;
  let modalService: NgbModal;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule, NgbModalModule, PipesModule, MatFormFieldModule, MatAutocompleteModule ],
      declarations: [ SourceFormComponent, SourceRemovalModalComponent ],
      providers: [
        { provide: SourceService, useClass: SourceServiceStub },
        { provide: NgRedux, useValue: mockRedux }
      ]
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ SourceRemovalModalComponent ]
      }
    }).compileComponents();
  }));

  beforeEach(() => {
    modalService = TestBed.get(NgbModal);
    fixture = TestBed.createComponent(SourceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    redux = TestBed.get(NgRedux);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set methods on changes depending on entityType', () => {
    const changes = { entityType: { previousValue: undefined, currentValue: 'symptom' } };

    const setLiveSearchFnSpy = spyOn(<any>component, 'setLiveSearchFn').and.callThrough();
    const setAddSourceToServerFn = spyOn(<any>component, 'setAddSourceToServerFn').and.callThrough();

    component.entityType = <any>changes.entityType.currentValue;
    component.ngOnChanges(<any>changes);

    changes.entityType.currentValue = 'treatment';
    component.entityType = <any>changes.entityType.currentValue;
    component.ngOnChanges(<any>changes);

    expect(setLiveSearchFnSpy).toHaveBeenCalledTimes(2);
    expect(setAddSourceToServerFn).toHaveBeenCalledTimes(2);
  });

  it('should set methods on changes depending on entityType (ngOnChanges)', () => {
    const changes = { entityType: { previousValue: undefined, currentValue: 'symptom' } };

    const setLiveSearchFnSpy = spyOn(<any>component, 'setLiveSearchFn').and.callThrough();
    const setAddSourceToServerFn = spyOn(<any>component, 'setAddSourceToServerFn').and.callThrough();

    component.entityType = <any>changes.entityType.currentValue;
    component.ngOnChanges(<any>changes);

    changes.entityType.currentValue = 'treatment';
    component.entityType = <any>changes.entityType.currentValue;
    component.ngOnChanges(<any>changes);

    expect(setLiveSearchFnSpy).toHaveBeenCalledTimes(2);
    expect(setAddSourceToServerFn).toHaveBeenCalledTimes(2);
  });

  it('should not set methods if entityType value haven\'t been changed (ngOnChanges)', () => {
    const changes = { entityType: { previousValue: 'symptom', currentValue: 'symptom' } };

    const setLiveSearchFnSpy = spyOn(<any>component, 'setLiveSearchFn').and.callThrough();
    const setAddSourceToServerFn = spyOn(<any>component, 'setAddSourceToServerFn').and.callThrough();

    component.entityType = <any>changes.entityType.currentValue;
    component.ngOnChanges(<any>changes);

    expect(setLiveSearchFnSpy).not.toHaveBeenCalled();
    expect(setAddSourceToServerFn).not.toHaveBeenCalled();
  });

  it('should trigger addition of new source ctrl (onAddSourceClick)', () => {
    const sourceData = {
      source: 'test',
      sourceType: 'testUrl',
      sourceID: 0
    };
    const addToSourcesSpy = spyOn(<any>component, 'addToSources').and.callFake(() => {});
    let res;

    component.sourceCtrl.setValue(sourceData.source);
    component.sourceTypeCtrl.setValue(sourceData.sourceType);
    component.sourceIDCtrl.setValue(sourceData.sourceID);
    component.onAddSourceClick();
    res = addToSourcesSpy.calls.mostRecent().args[0];

    expect(res.source).toEqual(sourceData.source);
    expect(res.sourceType).toEqual(sourceData.sourceType);
    expect(res.sourceID).toEqual(sourceData.sourceID);
    expect(component.sourceCtrl.value).toEqual(null);
    expect(component.sourceTypeCtrl.value).toEqual(null);
    expect(component.sourceIDCtrl.value).toEqual(null);
  });

  it('should clean suggestions (hideAutoCompete)', () => {
    component.suggestions = [ <any>'test' ];
    component.hideAutoCompete();

    expect(component.suggestions.length).toEqual(0);
  });

  it('should return source data by index (getSourceData)', () => {
    const source = 'Some source';

    component.sourcesData = [ <any>source ];

    expect(component.getSourceData(0)).toEqual(<any>source);
  });

  it('should return verified ctrl by index (getVerifiedCtrl)', () => {
    const formCtrl = new FormControl('test');

    component.sourceCtrlArray = new FormArray([ new FormGroup({ verified: formCtrl }) ]);

    expect(component.getVerifiedCtrl(0).value).toEqual(formCtrl.value);
  });

  it('should set form controls values for the adding source (onSelectSource)', () => {
    const sourceData = {
      source: 'test',
      sourceType: 'testUrl',
      sourceID: 0
    };
    const hideAutoCompleteSpy = spyOn(<any>component, 'hideAutoCompete').and.callFake(() => {});

    component.onSelectSource(<SourceInfo.Source>sourceData);

    expect(component.sourceCtrl.value).toEqual(sourceData.source);
    expect(component.sourceTypeCtrl.value).toEqual(sourceData.sourceType);
    expect(component.sourceIDCtrl.value).toEqual(sourceData.sourceID);
    expect(hideAutoCompleteSpy).toHaveBeenCalled();
  });

  it('should remove source and push event out (removeSource)', fakeAsync(() => {
    const sourceData = {
      source: 'test',
      sourceType: 'testUrl',
      sourceID: 0
    };
    const sourceCtrl = fb.group(sourceData);
    const modalRef = { result: Promise.resolve('drug'), componentInstance: {} };
    const modalOpenSpy = spyOn(modalService, 'open').and.returnValue(modalRef);
    const removeSourceLocalSpy = spyOn(<any>component, 'removeSourceLocal').and.callFake(() => {});
    const removeSourceFromTreatmentSpy = spyOn(<any>component, 'removeSourceFromTreatment').and.callFake(() => {});
    const removeSourceFromSymptomSpy = spyOn(<any>component, 'removeSourceFromSymptom').and.callFake(() => {});
    const removeSourceFromIllnessSpy = spyOn(<any>component, 'removeSourceFromIllness').and.callFake(() => {});

    component.sourceCtrlArray = new FormArray([ sourceCtrl ]);
    component.sourcesData =  { [sourceData.sourceID]: <any>sourceData };

    component.removeSource(0);
    tick();
    expect(removeSourceFromTreatmentSpy).toHaveBeenCalledWith(0, sourceData);

    component.noSourceRemovalOptions = true;
    removeSourceFromTreatmentSpy.calls.reset();
    component.removeSource(0);
    tick();
    expect(removeSourceLocalSpy).toHaveBeenCalled();
    expect(removeSourceFromTreatmentSpy).not.toHaveBeenCalledWith(0, sourceData);

    component.noSourceRemovalOptions = false;

    modalRef.result = Promise.resolve('treatment');
    component.removeSource(0);
    tick();
    expect(removeSourceLocalSpy).toHaveBeenCalled();
    expect(removeSourceFromTreatmentSpy).toHaveBeenCalledWith(0, sourceData, true);

    modalRef.result = Promise.resolve('non-drug');
    component.removeSource(0);
    tick();
    expect(removeSourceLocalSpy).toHaveBeenCalled();
    expect(removeSourceFromTreatmentSpy).toHaveBeenCalledWith(0, sourceData);

    modalRef.result = Promise.resolve('symptom');
    component.removeSource(0);
    tick();
    expect(removeSourceLocalSpy).toHaveBeenCalled();
    expect(removeSourceFromSymptomSpy).toHaveBeenCalledWith(0, sourceData);

    modalRef.result = Promise.resolve('illness');
    component.removeSource(0);
    tick();
    expect(removeSourceLocalSpy).toHaveBeenCalled();
    expect(removeSourceFromIllnessSpy).toHaveBeenCalledWith(0, sourceData);

    removeSourceFromTreatmentSpy.calls.reset();
    removeSourceFromSymptomSpy.calls.reset();
    removeSourceFromIllnessSpy.calls.reset();
    modalRef.result = Promise.resolve(null);
    component.removeSource(0);
    tick();
    expect(removeSourceFromTreatmentSpy).not.toHaveBeenCalled();
    expect(removeSourceFromSymptomSpy).not.toHaveBeenCalled();
    expect(removeSourceFromIllnessSpy).not.toHaveBeenCalled();

    modalRef.result = Promise.reject('illness');
    component.removeSource(0);
    tick();
    expect(removeSourceFromTreatmentSpy).not.toHaveBeenCalled();
    expect(removeSourceFromSymptomSpy).not.toHaveBeenCalled();
    expect(removeSourceFromIllnessSpy).not.toHaveBeenCalled();
  }));

  it('should add new source ctrl (addNewSourceCtrl)', () => {
    const sourceData = {
      source: 'test',
      sourceType: 'testUrl',
      sourceID: 0
    };

    component.sourceCtrlArray = fb.array([]);
    (<any>component).addNewSourceCtrl(<any>sourceData);

    expect(component.sourceCtrlArray.at(0).value.sourceID).toEqual(sourceData.sourceID);
  });

  it('should add new source (addToSources)', fakeAsync(() => {
    const sourceData = {
      source: 'test',
      sourceType: 'testUrl',
      sourceID: 0
    };
    const emitter = new EventEmitter();
    const addSourceToServerSpy = spyOn(<any>component, 'addSourceToServer').and.returnValue(emitter);
    const isExistingSourceIdSpy = spyOn(<any>component, 'isExistingSourceId');
    const addNewSourceCtrlSpy = spyOn(<any>component, 'addNewSourceCtrl').and.callFake(() => {});
    let res;
    const sub = component.sourceAdded.subscribe(val => res = val);

    (<any>component).addToSources(<any>{});
    expect(addSourceToServerSpy).not.toHaveBeenCalled();
    expect(isExistingSourceIdSpy).not.toHaveBeenCalled();
    expect(addNewSourceCtrlSpy).not.toHaveBeenCalled();

    // when source already exists and added
    isExistingSourceIdSpy.and.returnValue(true);
    (<any>component).addToSources(<any>sourceData);
    tick();
    expect(addSourceToServerSpy).not.toHaveBeenCalled();
    expect(res.source).toEqual(sourceData);
    expect(res.isExisting).toBeTruthy();
    expect(res.isNew).toBeFalsy();

    // when source isn't added
    isExistingSourceIdSpy.and.returnValue(false);
    (<any>component).addToSources(<any>sourceData);
    tick();
    expect(addSourceToServerSpy).not.toHaveBeenCalled();
    expect(addNewSourceCtrlSpy).toHaveBeenCalled();
    expect(res.source).toEqual(sourceData);
    expect(res.isExisting).toBeFalsy();
    expect(res.isNew).toBeFalsy();

    // when source doesn't exist even on the serve side
    sourceData.sourceID = undefined;
    (<any>component).addToSources(<any>sourceData);
    tick();
    expect(addSourceToServerSpy).toHaveBeenCalled();
    expect(component.isSavingData).toBeTruthy();
    emitter.next({ ...sourceData, sourceID: 1 });
    expect(addNewSourceCtrlSpy).toHaveBeenCalled();
    expect(res.source.sourceID).toEqual(1);
    expect(res.isExisting).toBeFalsy();
    expect(res.isNew).toBeTruthy();

    sub.unsubscribe();
  }));

  it('should check existence of source (isExistingSourceId)', () => {
    component.sourceCtrlArray = fb.array([ { sourceID: 1 } ]);
    expect((<any>component).isExistingSourceId(1)).toBeTruthy();
    expect((<any>component).isExistingSourceId(2)).toBeFalsy();
  });

  it('setLiveSearchFn', () => {
    const res = 1;

    (<any>component).setLiveSearchFn(<any>(() => res));
    expect((<any>component).liveSearchSources('term')).toEqual(res);
  });

  it('setAddSourceToServerFn', () => {
    const res = 1;

    (<any>component).setAddSourceToServerFn(<any>(() => res));
    expect((<any>component).addSourceToServer(<any>{})).toEqual(res);
  });

  it('liveSearchSources', fakeAsync(() => {
    expect(() => {
      (<any>component).liveSearchSources('term').subscribe(() => {});
      tick();
    }).toThrow();
  }));

  it('addSourceToServer', fakeAsync(() => {
    expect(() => {
      (<any>component).addSourceToServer(<any>{}).subscribe(() => {});
      tick();
    }).toThrow();
  }));

  it('remove source methods', () => {
    const source = 'test';
    let res: any = {};

    component.sourceRemoved = new EventEmitter();
    component.sourceRemoved.subscribe(val => res = val);

    (<any>component).removeSourceFromIllness(0, <any>source);
    expect(res.action).toEqual('Illness');

    (<any>component).removeSourceFromSymptom(0, <any>source);
    expect(res.action).toEqual('Symptom');

    (<any>component).removeSourceFromTreatment(0, <any>source);
    expect(res.action).toEqual('Drug/NonDrug');

    (<any>component).removeSourceFromTreatment(0, <any>source, true);
    expect(res.action).toEqual('Treatment');

    (<any>component).removeSourceLocal(0, <any>source);
    expect(res.action).toBeFalsy();
  });

});
