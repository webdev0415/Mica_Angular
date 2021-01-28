import { createAction, props } from '@ngrx/store';
import SearchValue = Illness.SearchValue;

export const resetStore = createAction(
  '[By Drug] Reset store',
);

export const searchDrugs = createAction(
  '[By Drug] Search drugs',
  props<{ term: string, drugType: Treatments.Drug.DrugType, source?: Treatments.Drug.SearchSource }>()
);

export const searchDrugsSuccess = createAction(
  '[By Drug] Search drugs success',
  props<{ drugs: Treatments.Drug.Short[] }>()
);

export const resetDrugSearchResults = createAction(
  '[By Drug] Reset drug search results',
);

export const loadDrugInfo = createAction(
  '[By Drug] Load drug info',
  props<{ productId: string, ndc: boolean, drugType: Treatments.Drug.DrugType, cardinality: Treatments.Drug.Cardinality }>()
);

export const loadDrugInfoSuccess = createAction(
  '[By Drug] Load drug info success',
  props<{ drug: Treatments.Drug.GenericSearchModel }>()
);

export const searchIllnesses = createAction(
  '[By Drug] Search illnesses',
  props<{ term: string, includeSymptoms?: boolean }>()
);

export const searchIllnessesSuccess = createAction(
  '[By Drug] Search illnesses success',
  props<{ results: SearchValue[] }>()
);
