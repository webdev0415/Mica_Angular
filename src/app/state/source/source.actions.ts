import { createAction, props } from '@ngrx/store';

export const insertSymptomSource = createAction(
  '[Source] Insert Symptom Source',
  props<{ record: SourceInfo.Source }>()
);

export const setSymptomsSources = createAction(
  '[Source] Set the Sources of Symptoms',
  props<{ records: SourceInfo.Source[] }>()
);

export const insertTreatmentSource = createAction(
  '[Source] Insert Treatment Source',
  props<{ record: SourceInfo.Source }>()
);

export const removeSource = createAction(
  '[Source] Remove Source',
  props<{ sourceID: number, action: SourceInfo.Action }>()
);

export const loadTreatmentSources = createAction(
  '[Source] Load Treatment Sources',
  props<{ code: string | null, templateType: SourceInfo.TemplateType | null }>()
);

export const loadTreatmentSourcesSuccess = createAction(
  '[Source API] Load Treatment Sources',
  props<{ records: SourceInfo.Source[] }>()
);
