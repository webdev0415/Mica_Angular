import { ActionCreator } from "redux";
import { Symptoms } from "./symptoms.d";

export const SET_SYMPTOMS_DATA = "[Symptoms] Set Symptom Group Data";
export const UPGRADE_SYMPTOMS = "[Symptoms] Upgrade";
export const SET_MULTIPLIER_DATA = "[Global] Set multiplier data";
export const SET_SYMPTOM_DEFINITION = "[Global] Set symptom definition";
export const SET_NLP_SYMPTOMS = "[NLP] Set Nlp Symptoms";
export const RESET_NLP_SYMPTOMS = "[NLP] Reset Nlp Symptoms";

export const setSymptomGroup: ActionCreator<Symptoms.Actions.SetSymptomGroup> =
  (data: Workbench.SymptomGroup) => ({
    type: SET_SYMPTOMS_DATA,
    data: data
  });

export const setSymptomDefinition: ActionCreator<Symptoms.Actions.SetSymptomDefinition> =
  (values: Symptom.Definition[]) => ({
    type: SET_SYMPTOM_DEFINITION,
    values: values
  });

export const setNlpSymptoms: ActionCreator<Symptoms.Actions.SetNlpSymptoms> =
  (symptoms: any[], page: number, total: number) => ({
    type: SET_NLP_SYMPTOMS,
    symptoms,
    page,
    total
  });

export const resetNlpSymptoms: ActionCreator<Symptoms.Actions.ResetNlpSymptoms> =
  () => ({
    type: RESET_NLP_SYMPTOMS
  });
