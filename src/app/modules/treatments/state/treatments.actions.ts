import { createAction, props } from '@ngrx/store';

type TreatmentsGroup = Treatments.Drug.Group | Treatments.NonDrug.Group;

export const setActiveTreatmentsRecord = createAction(
  '[Treatments] Set active Record',
  props<{ record: Treatments.Record.New | null, isNew: boolean }>()
);

export const setActiveTreatmentsRecordGroups = createAction(
  '[Treatments] Set active Record Groups',
  props<{ template: Treatments.Types.Template, groups: TreatmentsGroup[] }>()
);

export const toggleValidation = createAction(
  '[Treatments] Toggle validation',
  props<{ value?: boolean }>()
);

export const loadTreatmentTypes = createAction(
  '[Treatments] Load treatment types'
);

export const loadTreatmentTypesSuccess = createAction(
  '[Treatments API] Load treatment types success',
  props<{ treatmentTypes: Treatments.Types.Template[] }>()
);

export const searchDrugsByName = createAction(
  '[Treatments] Search drugs by name',
  props<{ term: string, drugType: Treatments.Drug.DrugType, source?: Treatments.Drug.SearchSource }>()
);

export const searchDrugsByNameSuccess = createAction(
  '[Treatments API] Search drugs by name success',
  props<{ drugs: Treatments.Drug.Short[] }>()
);

export const resetStepper = createAction(
  '[Treatments] Reset add drug stepper',
);

export const loadDrugInfo = createAction(
  '[Treatments] Load drug info',
  props<{ productId: string, ndc: boolean, drugType: Treatments.Drug.DrugType, cardinality: Treatments.Drug.Cardinality }>()
);

export const loadDrugInfoSuccess = createAction(
  '[Treatments API] Load drug info success',
  props<{ drug: Treatments.Drug.GenericSearchModel }>()
);

// drug-stepper actions
export const searchStepperIllnesses = createAction(
  '[Treatments] Search stepper autocomplete illnesses',
  props<{ term: string }>()
);
export const searchStepperIllnessesSuccess = createAction(
  '[Treatments API] Search stepper autocomplete illnesses success',
  props<{ illnesses: Illness.SearchValue[] }>()
);

export const searchStepperIllnessesTwo = createAction(
  '[Treatments] Search stepper autocomplete illnesses two',
  props<{ term: string }>()
);

export const searchStepperIllnessesTwoSuccess = createAction(
  '[Treatments API] Search stepper autocomplete illnesses two success',
  props<{ illnesses: Illness.SearchValue[] }>()
);


// drug/non-drug actions

export const saveDrug = createAction(
  '[Treatments] Save drug',
  props<{ drug: Treatments.Drug.Description, atcGroup: Treatments.AtcGroup, template: Treatments.Types.Template }>()
);

export const saveNonDrug = createAction(
  '[Treatments] Save non-drug',
  props<{ nonDrug: Treatments.NonDrug.Description, atcGroup: Treatments.AtcGroup, template: Treatments.Types.Template }>()
);

export const removeDrug = createAction(
  '[Treatments] Remove drug',
  props<{ drugIdx: number, groupIdx: number, template: Treatments.Types.Template }>()
);

export const removeNonDrug = createAction(
  '[Treatments] Remove non-drug',
  props<{ nonDrugIdx: number, groupIdx: number, template: Treatments.Types.Template }>()
);

export const updateRecord = createAction(
  '[Treatments] Update record',
  props<{ record: Treatments.Record.New }>()
);
