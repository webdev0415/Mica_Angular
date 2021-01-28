import { createSelector } from '@ngrx/store';

const selectSources = (state: State.Root): State.Sources => state.sources;

export const selectSymptomSources = createSelector(
  selectSources,
  data => data.symptomSources,
);

export const selectTreatmentSources = createSelector(
  selectSources,
  data => data.treatmentSources,
);

export const selectSymptomSourceByID = (sourceID: number) => createSelector(
  selectSymptomSources,
  sources => sources[sourceID],
);

export const selectSymptomSourceNameByID = (sourceID: number) => createSelector(
  selectSymptomSourceByID(sourceID),
  data => data ? data.source : ''
);

export const selectSymptomSourceByValue = (sourceToCheck: string) => createSelector(
  selectSymptomSources,
  sources => {
    return Object.values(sources).find(data => data.source.trim().toUpperCase() === sourceToCheck.trim().toUpperCase());
  }
);

export const treatmentSourceByID = (sourceID: number) => createSelector(
  selectTreatmentSources,
  sources => sources[sourceID]
);
