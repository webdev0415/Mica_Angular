import { sourceInit } from '../../app.config';
import { reducer } from './source.reducer';
import * as SourceActions from './source.actions'

const source: SourceInfo.Source = <SourceInfo.Source>{ source: 'source', sourceType: 'someUrl', sourceID: 23 };

describe('source reducer', () => {

  it('on insertSymptomSource', () => {
    const state = { ...sourceInit };
    const newState = reducer(state, SourceActions.insertSymptomSource({ record: source }));
    expect(newState.symptomSources[source.sourceID]).toBe(source);
  });

  it('on insertTreatmentSource', () => {
    const state = { ...sourceInit };
    const newState = reducer(state, SourceActions.insertTreatmentSource({ record: source }));
    expect(newState.treatmentSources[source.sourceID]).toEqual(source);
  });

  it('on setSymptomsSources', () => {
    const state = { ...sourceInit };
    const newState = reducer(state, SourceActions.setSymptomsSources({ records: [ source ] }));
    expect(newState.symptomSources).toEqual({ [source.sourceID]: source });
  });

  it('on loadTreatmentSourcesSuccess', () => {
    const state = { ...sourceInit };
    const newState = reducer(state, SourceActions.loadTreatmentSourcesSuccess({ records: [ source ] }));
    expect(newState.treatmentSources).toEqual({ [source.sourceID]: source });
  });

});
