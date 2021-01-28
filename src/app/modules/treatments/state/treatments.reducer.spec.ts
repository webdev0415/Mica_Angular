import { reducer } from './treatments.reducer';
import * as TreatmentsActions from './treatments.actions';
import * as SourcesActions from '../../../state/source/source.actions';
import { treatmentsInit } from 'app/app.config';
import { fakeAsync, tick } from '@angular/core/testing';

describe('treatmentsReducer', () => {

  it('on setActiveTreatmentsRecord', () => {
    const newRecord = <Treatments.Record.New>{
      icd10Code: '17',
      symptomID: '17'
    };
    const newState = reducer(treatmentsInit, TreatmentsActions.setActiveTreatmentsRecord({ record: newRecord, isNew: true }));
    expect(newState.showValidation).toBeFalsy();
    expect(newState.currentRecord.isNew).toBeTruthy();
    expect(newState.currentRecord.record.icd10Code).toEqual('17');
    expect(newState.currentRecord.record.symptomID).toEqual('17');
  });

  it('on toggleValidation', () => {
    const newState = reducer(treatmentsInit, TreatmentsActions.toggleValidation({}));
    expect(newState.showValidation).toBeTruthy();
  });

  it('TOGGLE_VALIDATION', () => {
    const initialState = treatmentsInit;
    let newState;

    initialState.showValidation = true;
    newState = reducer(initialState, TreatmentsActions.toggleValidation({ value: false }));
    expect(newState.showValidation$).toBeFalsy();
  });

  it('SET_ACTIVE_TREATMENTS_RECORD_GROUPS', () => {
    const state = {
      ...treatmentsInit,
      currentRecord: { record: null }
    };
    const props = { groups: [], template: { name: 'test', typeID: 1, treatmentTypeDesc: [] } };
    let newState;

    newState = reducer(<any>state, TreatmentsActions.setActiveTreatmentsRecordGroups(props));
    expect(newState.currentRecord).toEqual(state.currentRecord);

    state.currentRecord.record = { icd10Code: 'test', treatments: null };
    newState = reducer(<any>state, TreatmentsActions.setActiveTreatmentsRecordGroups(props));
    expect(newState.currentRecord.record.treatments[0].groups).toEqual([]);

    state.currentRecord.record.treatments = [];
    newState = reducer(<any>state, TreatmentsActions.setActiveTreatmentsRecordGroups(props));
    expect(newState.currentRecord.record.treatments[0].groups).toEqual([]);

    state.currentRecord.record.treatments = [ { name: 'test', typeID: 1 } ];
    newState = reducer(<any>state, TreatmentsActions.setActiveTreatmentsRecordGroups(props));
    expect(newState.currentRecord.record.treatments[0].groups).toEqual([]);
  });

  it('on removeSource', fakeAsync(() => {
    const state = {
      ...treatmentsInit,
      currentRecord: {
        record: {
          treatments: [
            { groups: [ { drugs: [ { sourceInfo: [ { sourceID: 1 } ] } ] } ] },
          ]
        }
      }
    };
    const newState = reducer(<any>state, SourcesActions.removeSource({ sourceID: 1, action: 'Treatment'}));

    tick();
    expect(newState.currentRecord.record.treatments[0].groups[0].drugs[0].sourceInfo.length).toEqual(0);
  }));
});
