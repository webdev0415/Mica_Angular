import {ActionCreator} from "redux";
import {Store} from "../store.d";

export type SET_ECW_PARAMS = "[ECW] Set params";
export const SET_ECW_PARAMS = "[ECW] Set params";

export type SetEcwParams = Readonly<{
  type: SET_ECW_PARAMS,
  params: ECW.Params
}>
export const setEcwParams = (params: ECW.Params): SetEcwParams => ({
  type: SET_ECW_PARAMS,
  params
})


export type SET_ECW_ACTIVE_ILLNESS = "[ECW] Set Active Illness";
export const SET_ECW_ACTIVE_ILLNESS = "[ECW] Set Active Illness";

export type SetEcwActiveIllness = Readonly<{
  type: SET_ECW_ACTIVE_ILLNESS,
  illness: ECW.Illness
}>
export const setEcwActiveIllness = (illness: ECW.Illness): SetEcwActiveIllness => ({
  type: SET_ECW_ACTIVE_ILLNESS,
  illness
})


export type UPSERT_ECW_ILLNESS = "[ECW] Upsert Illness";
export const UPSERT_ECW_ILLNESS = "[ECW] Upsert Illness";

export type UpsertEcwIllness = Readonly<{
  type: UPSERT_ECW_ILLNESS,
  IllnessData: ECW.IllnessData
}>
export const upsertEcwIllness = (IllnessData: ECW.IllnessData): UpsertEcwIllness => ({
  type: UPSERT_ECW_ILLNESS,
  IllnessData
})


export type DELETE_ECW_SYMPTOM = "[ECW] Delete Symptom";
export const DELETE_ECW_SYMPTOM = "[ECW] Delete Symptom";

export type DeleteEcwSymptom = Readonly<{
  type: DELETE_ECW_SYMPTOM,
  symptomID: string,
  categoryID: string
}>
export const deleteEcwSymptom = (symptomID: string, categoryID: string): DeleteEcwSymptom => ({
  type: DELETE_ECW_SYMPTOM,
  symptomID,
  categoryID
})

export type SET_ECW_VALIDATION_ILLNESS = "[ECW] Set Validation Illness";
export const SET_ECW_VALIDATION_ILLNESS = "[ECW] Set Validation Illness";

export type SetValidateSymptom = Readonly<{
  type: SET_ECW_VALIDATION_ILLNESS,
  ecwIllness: ECW.IllnessData | null,
  activeIllness: Illness.Normalized.IllnessValue,
  nlpIllness: ECW.IllnessData | null,
}>

/* istanbul ignore next */
export const setEcwValidationIllness = (ecwIllness: ECW.IllnessData | null,
                                          activeIllness: Illness.Normalized.IllnessValue,
                                        nlpIllness: ECW.IllnessData | null = null): SetValidateSymptom => ({
  type: SET_ECW_VALIDATION_ILLNESS,
  ecwIllness,
  activeIllness,
  nlpIllness
})

export type REMOVE_ECW_VALIDATION_SYMPTOM = "[ECW] Remove Validation Symptom";
export const REMOVE_ECW_VALIDATION_SYMPTOM = "[ECW] Remove Validation Symptom";

export type RemoveEcwValidationSymptom = Readonly<{
  type: REMOVE_ECW_VALIDATION_SYMPTOM,
  symptomID: string,
  categoryID: string,
  groupID: string
}>
export const removeEcwValidationSymptom = (symptomID: string, categoryID: string, groupID: string): RemoveEcwValidationSymptom => ({
  type: REMOVE_ECW_VALIDATION_SYMPTOM,
  symptomID,
  categoryID,
  groupID
})

export type ADD_ECW_VALIDATION_SYMPTOM = "[ECW] Add Validation Symptom";
export const ADD_ECW_VALIDATION_SYMPTOM = "[ECW] Add Validation Symptom";

export type AddEcwValidationSymptom = Readonly<{
  type: ADD_ECW_VALIDATION_SYMPTOM,
  symptomID: string,
  categoryID: string,
  groupID: string
}>
export const addEcwValidationSymptom = (symptomID: string, categoryID: string, groupID: string): AddEcwValidationSymptom => ({
  type: ADD_ECW_VALIDATION_SYMPTOM,
  symptomID,
  categoryID,
  groupID
})

export type ecwAction = SetEcwParams |
  SetEcwActiveIllness |
  UpsertEcwIllness |
  DeleteEcwSymptom |
  SetValidateSymptom |
  RemoveEcwValidationSymptom |
  AddEcwValidationSymptom;
