import { defaultState } from '../../app.config';
import {
  selectTreatmentSources,
  selectSymptomSources,
  selectSymptomSourceByID,
  selectSymptomSourceByValue,
  selectSymptomSourceNameByID
} from './source.selectors';

const source: SourceInfo.Source = <SourceInfo.Source>{ source: 'source', sourceType: 'someUrl', sourceID: 23 };
const state =  Object.assign({ ...defaultState }, {
  sources: {
    symptomSources: { [source.sourceID]: source },
    treatmentSources: { [source.sourceID]: source }
  }
});

describe('source selectors', () => {

  it('selectTreatmentSources', () => {
    expect(selectTreatmentSources(state)).toEqual(state.sources.treatmentSources);
  });

  it('selectSymptomSources', () => {
    expect(selectSymptomSources(state)).toEqual(state.sources.symptomSources);
  });

  it('selectSymptomSourceByID', () => {
    expect(selectSymptomSourceByID(source.sourceID)(state)).toEqual(source);
  });

  it('selectSymptomSourceByValue ', () => {
    expect(selectSymptomSourceByValue(source.source)(state)).toBeTruthy();
    expect(selectSymptomSourceByValue('unknown')(state)).toBeFalsy();
  });

  it('symptomSourceNameByID  ', () => {
    expect(selectSymptomSourceNameByID(source.sourceID)(state)).toBe(source.source);
  });
});
