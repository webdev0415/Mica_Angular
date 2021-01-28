import { createSelector } from '@ngrx/store';

const selectTreatments = (state: State.Root) => state.treatments;

export const selectCurrentTreatmentsRecord = createSelector(
  selectTreatments,
  treatments => treatments.currentRecord,
);

export const selectCurrentTreatmentsRecordType = createSelector(
  selectTreatments,
  ({ currentRecord }) => currentRecord.record && (currentRecord.record.symptomID ? 'symptom' : 'illness') || null,
);

export const selectShowTreatmentsValidation = createSelector(
  selectTreatments,
  treatments => treatments.showValidation,
);

export const selectDrugTemplates = createSelector(
  selectTreatments,
  treatments => treatments.drugTemplates,
);

export const selectNonDrugTemplates = createSelector(
  selectTreatments,
  treatments => treatments.nonDrugTemplates,
);


// addDrugStepper selectors

export const selectStepperDrugsSearchResults = createSelector(
  selectTreatments,
  treatments => treatments.addDrugStepper.drugsSearchResults,
);

export const selectStepperIllnessSearchResults = createSelector(
  selectTreatments,
  treatments => treatments.addDrugStepper.illnessSearchResults,
);

export const selectStepperIllnessSearchResultsTwo = createSelector(
  selectTreatments,
  treatments => treatments.addDrugStepper.illnessSearchResultsTwo,
);

export const selectStepperSelectedDrugInfo = createSelector(
  selectTreatments,
  treatments => treatments.addDrugStepper.selectedDrugInfo,
);

export const selectStepperDrugsSearching = createSelector(
  selectTreatments,
  treatments => treatments.addDrugStepper.drugsSearching,
);
