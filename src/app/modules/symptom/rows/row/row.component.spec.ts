import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { SymptomRowComponent } from './row.component';
import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { BiasComponent } from '../../bias/bias.component';
import {
  AbstractControl, ControlValueAccessor, FormArray, FormControl, FormGroup, FormsModule, NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms';
import { LikelihoodComponent } from '../../likelihood/likelihood.component';
import { NgRedux } from '@angular-redux/store';
import { defaultState, navInit, symptomsInit, workbenchInit } from 'app/app.config';
import * as _ from 'lodash';
import { of } from 'rxjs/observable/of';
import Data = Symptom.Data;
import DataStoreRefType = Workbench.DataStoreRefType;
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MockSourceFormComponent } from '../../../../../test/components-stubs';
import { SourceServiceStub } from '../../../../../test/services-stubs/source.service.stub';
import { SourceService } from '../../../../services';
import * as workbenchSelectors from '../../../../state/workbench/workbench.selectors';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

const testData = require('../../../../../../server/test-storage.json').symptoms.data;
const group = testData[Object.keys(testData)[0]];
const fakeIllnesses: Illness.Normalized.IllnessValue[] = require('../../../../../test/data/illnesses.json');
const fakeSymptoms: Symptom.Data[] = require('../../../../../test/data/symptoms.json');
const fakeCategories: Workbench.Normalized.Category[] = group.categories;
_.map(fakeSymptoms, (symptom: Symptom.Data) => symptomsInit.entities.symptoms[symptom.symptomID] = symptom);
_.map(fakeIllnesses, (illness: Illness.Normalized.IllnessValue) => workbenchInit.illnesses.values[illness.form.idIcd10Code] = illness);
_.map(fakeCategories, (category: Workbench.Normalized.Category) => symptomsInit.entities.categories[category.categoryID] = category);
(symptomsInit.entities as any).symptomGroups = testData;
navInit.activeGroup = fakeIllnesses[0].form.symptomGroups[0] as any;
(workbenchInit.illnesses as any).active = fakeIllnesses[0].form.idIcd10Code;

const mockRedux = {
  getState: () => {
    return {
      symptoms: symptomsInit,
      nav: navInit
    }
  },
  select: selector => of(selector({})),
  dispatch: (arg: any) => {
  }
};

@Component({
  selector: 'mica-modifier',
  template: '<div></div>'
})
class MockModifierComponent {
  @Input() readOnly = false;
  @Input() readonly symptomData: Symptom.Data;
  @Input() readonly dataStoreRefTypes: Workbench.DataStoreRefTypesDictionary;
  @Input() modifierCtrlArray: FormArray;
  @Input() alwaysControlIsVisible: boolean;
  @Output() errors: EventEmitter<Symptom.ModifierError[]> = new EventEmitter();
}

@Component({
  selector: 'mica-multiplier',
  template: '<div></div>',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockMultiplierComponent),
      multi: true
    }
  ]
})
class MockMultiplierComponent implements ControlValueAccessor {
  @Input() readOnly = false;
  @Input() readonly symptomData: Symptom.Data;
  @Input() multiplierDataStore: Workbench.DataStoreRefType;
  @Input() allMultiplierValues: (string[] | [number, number])[];
  @Input() removable: boolean;
  @Input() rowIndex: number;
  @Input() hasBodySelector: boolean;
  @Output() removeRow: EventEmitter<boolean> = new EventEmitter();
  @Output() toggleDescriptor: EventEmitter<boolean> = new EventEmitter();
  writeValue(obj: any) {};
  registerOnChange(fn: any) {};
  registerOnTouched(fn: any) {};
}

@Component({
  selector: 'symptom-descriptor-image',
  template: '<div></div>'
})
class MockDescriptorImageComponent {
  @Input() readOnly = false;
  @Input() hasBodySelector = false;
  @Input() descriptorFile: string;
  @Input() id: string;
  @Input() rowIndex: number;
  @Input() value: string;
  @Input() bodyPart = '';
  @Output() select: EventEmitter<string> = new EventEmitter();
  @Output() close: EventEmitter<boolean> = new EventEmitter();
}

const state = _.cloneDeep(defaultState);

describe('SymptomRowComponent', () => {
  let component: SymptomRowComponent;
  let redux: NgRedux<State.Root>;
  let store: MockStore<State.Root>;
  let fixture: ComponentFixture<SymptomRowComponent>;
  let sourceService: SourceService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SymptomRowComponent,
        MockMultiplierComponent,
        BiasComponent,
        LikelihoodComponent,
        MockModifierComponent,
        MockDescriptorImageComponent,
        MockSourceFormComponent
      ],
      providers: [
        provideMockStore({ initialState: state }),
        { provide: SourceService, useClass: SourceServiceStub },
        { provide: NgRedux, useValue: mockRedux }
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SymptomRowComponent);
    component = fixture.componentInstance;
    redux = TestBed.get(NgRedux);
    store = TestBed.get(MockStore);
    sourceService = TestBed.get(SourceService);
    (component as any).symptomData = fakeSymptoms[0];

    const symptoms = fakeIllnesses[0].entities.symptoms;
    const row = symptoms[Object.keys(symptoms)[0]].rows[0];
    const controls: { [key: string]: AbstractControl } = {};

    row['minDiagCriteria'] = false;
    row['medNecessary'] = false;
    row['must'] = false;
    row['ruleOut'] = false;

    _.map(row as any, (val, key) => controls[key] = new FormControl(val));
    (component as any).rowCtrl = new FormGroup(controls);
    (component as any).dataStoreRefTypes = { name: { title: 'title' } as DataStoreRefType };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('multiplierValue', () => {
    spyOn(component['rowCtrl'], 'get').and.returnValue(null);
    expect(component.multiplierValue).toEqual([]);
  });

  it('multiplierDataStore', () => {
    (component as any).symptomData = { multipleValues: null } as Data;
    expect(component.multiplierDataStore).toBe(null);
  });

  it('onModifierErrors', () => {
    const errorPublisherSpy = spyOn(component['errorPublisherSrc'], 'next').and.callThrough();
    component.onModifierErrors([]);
    expect(errorPublisherSpy).toHaveBeenCalled();
  });

  it('onMultiplierSelect', () => {
    (component as any).rowCtrl = new FormGroup({ control: new FormControl('') });
    expect(component.onMultiplierSelect(['value'])).toBeUndefined();
  });

  it('horizontalFit', () => {
    (component as any).rowEl = { nativeElement: { clientWidth: '1200' } };
    expect(component.horizontalFit).toEqual('horizontal');
    (component as any).rowEl = { nativeElement: { clientWidth: '900' } };
    expect(component.horizontalFit).toEqual('vertical');
  });

  it('ngOnInit', () => {
    (component as any).symptomData = { multipleValues: null, symptomsModel: { descriptorFile: null } } as Data;
    (component as any).rowCtrl = new FormGroup({ control: new FormControl('') });
    const consoleSpy = spyOn(console, 'error').and.callThrough();
    expect(component.ngOnInit()).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('ngOnInit', () => {
    (component as any).symptomData = { multipleValues: null, symptomsModel: { descriptorFile: null } } as Data;
    (component as any).rowCtrl = new FormGroup({ bias: new FormControl('') });
    const consoleSpy = spyOn(console, 'error').and.callThrough();
    expect(component.ngOnInit()).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalled();
  });


  it('onToggleDescriptor', () => {
    const dispatchSpy = spyOn(redux, 'dispatch').and.callThrough();
    spyOnProperty<any>(component, 'state', 'get').and.returnValue({...defaultState});
    component.onToggleDescriptor();
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('onMultiplierSelect', () => {
    const multiplierCtrl = new FormControl('');
    const setValueSpy = spyOn(multiplierCtrl, 'setValue').and.callThrough();
    component.rowCtrl = new FormGroup({
      multiplier: multiplierCtrl
    });
    const value = 'value';
    component.onMultiplierSelect([value]);
    expect(setValueSpy).toHaveBeenCalled();
  });

  it('onResize', () => {
    const detectChangesSpy = spyOn(component['cd'], 'detectChanges').and.callThrough();
    component['onResize']();
    expect(detectChangesSpy).toHaveBeenCalled();
  });

  it('onPublishError', () => {
    const emitErrorsSpy = spyOn(component.errors, 'emit').and.callThrough();
    const symptomError = {
      index: 1,
      bias: {}
    };
    component['onPublishError'](symptomError);
    expect(emitErrorsSpy).toHaveBeenCalled();
  });

  it('onPublishError', () => {
    const emitErrorsSpy = spyOn(component.errors, 'emit').and.callThrough();
    const symptomError = {
      index: 1
    };
    component['onPublishError'](symptomError);
    expect(emitErrorsSpy).toHaveBeenCalledWith({});
  });

  it('addErrorTrackers', () => {
    component.hasScale = true;
    const subsPushSpy = spyOn(component['subs'], 'push').and.callThrough();
    component['addErrorTrackers'](null, null);
    expect(subsPushSpy).not.toHaveBeenCalled();
  });

  it('onModifierErrors', () => {
    component['errorPublisherSrc'].next({} as any);
    const nextSpy = spyOn(component['errorPublisherSrc'], 'next').and.callThrough();
    const errors = [{} as any];
    component.onModifierErrors(errors);
    expect(nextSpy).toHaveBeenCalled();
  });

  it('ngOnDestroy clearTimeout', () => {
    component.timer = 1;
    const spyTimeout = spyOn(window, 'clearTimeout');
    component.ngOnDestroy();
    expect(spyTimeout).toHaveBeenCalled()
  });

  it('ngOnDestroy', () => {
    component.timer = null;
    const spyTimeout = spyOn(window, 'clearTimeout');
    component.ngOnDestroy();
    expect(spyTimeout).not.toHaveBeenCalled()
  });

  it('checkBoxChange minDiagCriteria', () => {
    const controlName = 'minDiagCriteria';
    const ruleOutCtrl = new FormControl(true);
    const setValueSpy = spyOn(ruleOutCtrl, 'setValue').and.callThrough();

    component.rowCtrl.controls[controlName].setValue(true);
    component.rowCtrl.setControl('ruleOut', ruleOutCtrl);
    component.checkBoxChange(controlName);
    expect(setValueSpy).toHaveBeenCalled();
  });

  it('checkBoxChange medNecessary', () => {
    const controlName = 'medNecessary';
    const ruleOutCtrl = new FormControl(true);
    const setValueSpy = spyOn(ruleOutCtrl, 'setValue').and.callThrough();

    component.rowCtrl.controls[controlName].setValue(true);
    component.rowCtrl.setControl('ruleOut', ruleOutCtrl);
    component.checkBoxChange(controlName);
    expect(setValueSpy).toHaveBeenCalled();
   });

  it('checkBoxChange must', () => {
    const controlName = 'must';
    component.rowCtrl.controls[controlName].setValue(true);
    const ruleOutCtrl = new FormControl(true);
    const setValueSpy = spyOn(ruleOutCtrl, 'setValue').and.callThrough();

    component.rowCtrl.controls[controlName].setValue(true);
    component.rowCtrl.setControl('ruleOut', ruleOutCtrl);
    component.checkBoxChange(controlName);
    expect(setValueSpy).toHaveBeenCalled();
   });

  it('checkBoxChange ruleOut', () => {
    const controlName = 'ruleOut';
    component.rowCtrl.controls[controlName].setValue(true);
    const mustCtrl  = new FormControl(true);
    const setValueSpy = spyOn(mustCtrl, 'setValue').and.callThrough();

    component.rowCtrl.controls[controlName].setValue(true);
    component.rowCtrl.setControl('must', mustCtrl);
    component.checkBoxChange(controlName);
    expect(setValueSpy).toHaveBeenCalled();
   });

  it('checkBoxChange ruleOut with false', () => {
    const controlName = 'ruleOut';
    const mustCtrl = new FormControl(true);
    const setValueSpy = spyOn(mustCtrl, 'setValue').and.callThrough();

    component.rowCtrl.controls[controlName].setValue(false);
    component.rowCtrl.setControl('must', mustCtrl);
    component.checkBoxChange(controlName);
    expect(setValueSpy).not.toHaveBeenCalled();
   });

  it('onSourceAdded', fakeAsync(() => {
    const dispatchReduxSpy = spyOn(redux, 'dispatch').and.callFake(() => {});
    const dispatchStoreSpy = spyOn(store, 'dispatch').and.callFake(() => {});
    const source = { source: 'test', rank: 1, sourceTitle: 'test' };

    component.onSourceAdded({
      source,
    });
    expect(dispatchReduxSpy).toHaveBeenCalled();
    expect(dispatchStoreSpy).toHaveBeenCalled();

    dispatchReduxSpy.calls.reset();
    dispatchStoreSpy.calls.reset();
    component.onSourceAdded({
      source,
      isNew: true
    });
    expect(dispatchReduxSpy).toHaveBeenCalled();
    expect(dispatchStoreSpy).toHaveBeenCalled();

    dispatchReduxSpy.calls.reset();
    dispatchStoreSpy.calls.reset();
    component.onSourceAdded({
      source,
      isExisting: true
    });
    expect(dispatchReduxSpy).toHaveBeenCalled();
    expect(dispatchStoreSpy).not.toHaveBeenCalled();
  }));

  it('removeSource', fakeAsync(() => {
    const dispatchSpy = spyOn(redux, 'dispatch').and.callFake(() => {});
    const removeTreatmentSourceSpy = spyOn(sourceService, 'removeSymptomSource').and.returnValue(of(1));
    const ctrl = new FormArray([ new FormControl() ]);
    const sourceInfoCtrlSpy = spyOnProperty(component, 'sourceInfoCtrl', 'get').and.returnValue(ctrl);
    const multiplierCtrlSpy = spyOnProperty(component, 'multiplierCtrl', 'get').and.returnValue(new FormControl({}));
    const source = { sourceType: 'test', sourceID: 1, source: 'test', rank: 1, sourceTitle: 'test' };
    const illness = {
      form: {
        icd10Code: 'icd',
        version: 1,
        state: 'state'
      }
    };
    const currentIllnessSpy = spyOn(workbenchSelectors, 'currentIllness');

    currentIllnessSpy.and.returnValue(null);
    component.removeSource({ idx: 0, source, action: 'Illness' });
    tick();
    expect(dispatchSpy).toHaveBeenCalled();

    currentIllnessSpy.and.returnValue(illness);

    ctrl.setControl(0, new FormControl(''));
    dispatchSpy.calls.reset();
    component.removeSource({ idx: 0, source, action: 'Illness' });
    tick();
    expect(removeTreatmentSourceSpy).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalled();
    expect(ctrl.length).toEqual(0);

    ctrl.setControl(0, new FormControl(''));
    dispatchSpy.calls.reset();
    removeTreatmentSourceSpy.calls.reset();
    component.removeSource({ idx: 0, source, action: 'Symptom' });
    tick();
    expect(removeTreatmentSourceSpy).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalled();
    expect(ctrl.length).toEqual(0);

    ctrl.setControl(0, new FormControl(''));
    dispatchSpy.calls.reset();
    removeTreatmentSourceSpy.calls.reset();
    component.removeSource({ idx: 0, source, action: 'Treatment' });
    tick();
    expect(removeTreatmentSourceSpy).not.toHaveBeenCalled();
    expect(dispatchSpy).not.toHaveBeenCalled();
    expect(ctrl.length).toEqual(1);

    ctrl.setControl(0, new FormControl(''));
    dispatchSpy.calls.reset();
    removeTreatmentSourceSpy.calls.reset();
    multiplierCtrlSpy.and.returnValue(null);
    component.removeSource({ idx: 0, source, action: 'Symptom' });
    tick();
    expect(removeTreatmentSourceSpy).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalled();
    expect(ctrl.length).toEqual(0);
  }));

});
