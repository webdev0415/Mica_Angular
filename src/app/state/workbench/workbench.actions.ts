import { Store } from "../store";

export type SET_ACTIVE_ILLNESS = "[Workbench] Set Active Illness";
export const SET_ACTIVE_ILLNESS = "[Workbench] Set Active Illness";
export type SetActiveIllness = Readonly<{
  type: SET_ACTIVE_ILLNESS,
  taskId: number;
  name: string;
  state: Illness.State;
  idIcd10Code: string;
  version: number;
}>;
export const setActiveIllness = (taskId: number, idIcd10Code: string, name: string, version: number, state: Illness.State): SetActiveIllness => ({
  type: SET_ACTIVE_ILLNESS,
  taskId,
  idIcd10Code,
  name,
  version,
  state
});

export type RESET_ACTIVE_ILLNESS = "[Workbench] Reset Active Illness";
export const RESET_ACTIVE_ILLNESS = "[Workbench] Reset Active Illness";
export type ResetActiveIllness = Readonly<{
  type: RESET_ACTIVE_ILLNESS
}>;
export const resetActiveIllness = (): ResetActiveIllness => ({
  type: RESET_ACTIVE_ILLNESS
});

export type SET_MANDATORY_SYMPTOM = "[Workbench] Set mandatory Symptom";
export const SET_MANDATORY_SYMPTOM = "[Workbench] Set mandatory Symptom";
export type SetMandatorySymptom = Readonly<{
  type: SET_MANDATORY_SYMPTOM,
  simptomID: string,
  basicSymptomID: string,
  groupID: string
}>
export const setMandatorySymptom = (simptomID: string, basicSymptomID: string, groupID: string) => ({
  type: SET_MANDATORY_SYMPTOM,
  simptomID,
  basicSymptomID,
  groupID
});

export type DELETE_MANDATORY_SYMPTOM = "[Workbench] Delete mandatory Symptom";
export const DELETE_MANDATORY_SYMPTOM = "[Workbench] Delete mandatory Symptom";
export type DeleteMandatorySymptom = Readonly<{
  type: DELETE_MANDATORY_SYMPTOM,
  simptomID: string,
  groupID: string
}>
export const deleteMandatorySymptom = (simptomID: string, groupID: string) => ({
  type: DELETE_MANDATORY_SYMPTOM,
  simptomID,
  groupID
});

export type SET_READONLY_ILLNESS = "[Workbench] Set Read Only Illness";
export const SET_READONLY_ILLNESS = "[Workbench] Set Read Only Illness";
export type SetReadOnlyIllness = Readonly<{
  type: SET_READONLY_ILLNESS,
  illness: Illness.FormValue | null
}>;
export const setReadOnlyIllness = (illness: Illness.FormValue | null): SetReadOnlyIllness => ({
  type: SET_READONLY_ILLNESS,
  illness
});


export type EDIT_READ_ONLY_ILLNESS = "[Workbench] Start Edit Read Only Illness";
export const EDIT_READ_ONLY_ILLNESS = "[Workbench] Start Edit Read Only Illness";
export interface EditReadOnlyIllness extends Store.Actions.ShareState {
  type: EDIT_READ_ONLY_ILLNESS;
}
export const editReadOnlyIllness = () => (stateRoot: State.Root): EditReadOnlyIllness => ({
  type: EDIT_READ_ONLY_ILLNESS,
  stateRoot
});


export type UPSERT_ILLNESS = "[Workbench] Upsert Illness";
export const UPSERT_ILLNESS = "[Workbench] Upsert Illness";
export type UpsertIllness = Readonly<{
  type: UPSERT_ILLNESS;
  formValue: Illness.FormValue;
}>;
export const upsertIllness = (formValue: Illness.FormValue): UpsertIllness => ({
  type: UPSERT_ILLNESS,
  formValue
});

export type UPSERT_ILLNESS_NORM = "[Workbench] Upsert Normalized Illness";
export const UPSERT_ILLNESS_NORM = "[Workbench] Upsert Normalized Illness";
export type UpsertIllnessNorm = Readonly<{
  type: UPSERT_ILLNESS_NORM;
  value: Illness.Normalized.IllnessValue;
}>;
export const upsertIllnessNorm = (value: Illness.Normalized.IllnessValue): UpsertIllnessNorm => ({
  type: UPSERT_ILLNESS_NORM,
  value
});

export type DELETE_ILLNESS = "[Workbench] Delete Illness";
export const DELETE_ILLNESS = "[Workbench] Delete Illness";
export type DeleteIllness = Readonly<{
  type: DELETE_ILLNESS;
  illness: string;
  version: number;
}>;
export const deleteIllness = (illness: string, version: number): DeleteIllness => ({
  type: DELETE_ILLNESS,
  illness,
  version
});

export type SET_SG_COMPLETE_STATUS = "[Workbench] Set Symptom Group Complete Status";
export const SET_SG_COMPLETE_STATUS = "[Workbench] Set Symptom Group Complete Status";
export type CompleteSymptomGroup = Readonly<{
  type: SET_SG_COMPLETE_STATUS;
  groupID: string;
  value: boolean;
}>;
export const completeSymptomGroup = (groupID: string, value: boolean): CompleteSymptomGroup => ({
  type: SET_SG_COMPLETE_STATUS,
  groupID,
  value
});

export type SET_ILLNESS_ERROR = "[Workbench] Set Illness Value Error";
export const SET_ILLNESS_ERROR = "[Workbench] Set Illness Value Error";
export type SetIllnessError = Readonly<{
  type: SET_ILLNESS_ERROR;
  error: Task.IllnessRootError
}>;
export const setIllnessError = (error: Task.IllnessRootError): SetIllnessError => ({
  type: SET_ILLNESS_ERROR,
  error
});

export type SET_SYMPTOM_ERROR = "[Workbench] Set Symptom Value Error";
export const SET_SYMPTOM_ERROR = "[Workbench] Set Symptom Value Error";
export type SetSymptomError = Readonly<{
  type: SET_SYMPTOM_ERROR;
  error: Symptom.ValueError
}>;
export const setSymptomError = (error: Symptom.ValueError): SetSymptomError => ({
  type: SET_SYMPTOM_ERROR,
  error
});

export type SET_MANY_SYMPTOM_ERRORS = "[Workbench] Set Many Symptom Value Errors";
export const SET_MANY_SYMPTOM_ERRORS = "[Workbench] Set Many Symptom Value Errors";
export type SetManySymptomErrors = Readonly<{
  type: SET_MANY_SYMPTOM_ERRORS;
  errors: Symptom.ValueError[]
}>;
export const setManySymptomErrors = (errors: Symptom.ValueError[]): SetManySymptomErrors => ({
  type: SET_MANY_SYMPTOM_ERRORS,
  errors
});

export type INSERT_SYMPTOM = "[Workbench] Insert Symptom";
export const INSERT_SYMPTOM = "[Workbench] Insert Symptom";
export type InsertSymptom = Readonly<{
  type: INSERT_SYMPTOM;
  value: Symptom.Value;
  path: Symptom.LocationData;
}>;
export const insertSymptom = (value: Symptom.Value, path: Symptom.LocationData): InsertSymptom => ({
  type: INSERT_SYMPTOM,
  value,
  path,
});

export type SAVE_SYMPTOM = "[Workbench] Save Symptom";
export const SAVE_SYMPTOM = "[Workbench] Save Symptom";
export type SaveSymptom = Readonly<{
  type: SAVE_SYMPTOM;
  value: Symptom.Value;
}>;
export const saveSymptom = (value: Symptom.Value): SaveSymptom => ({
  type: SAVE_SYMPTOM,
  value
});

export type DELETE_SYMPTOM = "[Workbench] Delete Symptom";
export const DELETE_SYMPTOM = "[Workbench] Delete Symptom";
export type DeleteSymptom = Readonly<{
  type: DELETE_SYMPTOM;
  symptomID: string;
  path: Symptom.LocationData;
}>;
export const deleteSymptom = (symptomID: string, path: Symptom.LocationData): DeleteSymptom => ({
  type: DELETE_SYMPTOM,
  symptomID,
  path
});



export type WorkbenchAction = SetActiveIllness | SetReadOnlyIllness | EditReadOnlyIllness | UpsertIllness | UpsertIllnessNorm
  | CompleteSymptomGroup | DeleteIllness | InsertSymptom | SaveSymptom | DeleteSymptom
  | SetIllnessError | SetSymptomError | SetManySymptomErrors
  | SetMandatorySymptom | DeleteMandatorySymptom | ResetActiveIllness;
