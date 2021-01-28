import { ActionCreator } from "redux";

export type ACTIVATE_SYMPTOM_TEMPLATE = "[SymptomTemplates] Activate Symptom";
export const ACTIVATE_SYMPTOM_TEMPLATE = "[SymptomTemplates] Activate Symptom";
export type ActivateSymptomTemplate = Readonly<{
  type: ACTIVATE_SYMPTOM_TEMPLATE,
  data: Symptom.Template | null;
}>;
export function upgradeSymptomTemplates(data: Symptom.Template | null): ActivateSymptomTemplate {
  return {
    type: ACTIVATE_SYMPTOM_TEMPLATE,
    data
  }
};

export type TOGGLE_TEMPLATE_SAVE = "[SymptomTemplates] Toggle save template";
export const TOGGLE_TEMPLATE_SAVE = "[SymptomTemplates] Toggle save template";
export type ToggleTemplateSave = Readonly<{
  type: TOGGLE_TEMPLATE_SAVE,
  value: boolean;
}>;
export function toggleTemplateSave(value: boolean): ToggleTemplateSave {
  return {
    type: TOGGLE_TEMPLATE_SAVE,
    value
  }
};


export type SymptomTemplatesAction = ActivateSymptomTemplate | ToggleTemplateSave;
