import { sourceInit } from '../../app.config'
import * as SourceActions from './source.actions'
import { Action, createReducer, on } from '@ngrx/store';

const sourceReducer = createReducer(
  sourceInit,
  on(SourceActions.loadTreatmentSourcesSuccess, (state, { records }) => {
    const treatmentSources: SourceInfo.SourcesDictionary = {};

    records.forEach((s: SourceInfo.Source) => {
      treatmentSources[<number>s.sourceID] = s;
    });

    return {
      ...state,
      treatmentSources
    };
  }),
  on(SourceActions.setSymptomsSources, (state, { records }) => {
    const symptomSources: SourceInfo.SourcesDictionary = {};

    records.forEach((s: SourceInfo.Source) => {
      symptomSources[<number>s.sourceID] = s;
    });

    return {
      ...state,
      symptomSources
    };
  }),
  on(SourceActions.insertSymptomSource, (state, { record }) => {
    return {
      ...state,
      symptomSources: {
        ...state.symptomSources,
        [<number>record.sourceID]: record
      }
    };
  }),
  on(SourceActions.insertTreatmentSource, (state, { record }) => {
    return {
      ...state,
      treatmentSources: {
        ...state.treatmentSources,
        [<number>record.sourceID]: record
      }
    };
  })
);

export function reducer(state: State.Sources | undefined, action: Action) {
  return sourceReducer(state, action);
}

