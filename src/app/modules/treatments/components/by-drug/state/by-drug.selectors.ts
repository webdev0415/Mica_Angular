import { createSelector } from '@ngrx/store';

const selectByDrug = (state: State.Root) => state.treatments.byDrug;

export const selectDrugSearchResults = createSelector(
  selectByDrug,
  byDrug => byDrug.drugsSearchResults,
);

export const selectActiveDrugInfo = createSelector(
  selectByDrug,
  byDrug => byDrug.activeDrugInfo,
);

export const selectIllnessSearchResults = createSelector(
  selectByDrug,
  byDrug => byDrug.illnessesSearchResults,
);
