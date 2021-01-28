import {symptomTemplatesInit} from "../../app.config";
import {ACTIVATE_SYMPTOM_TEMPLATE, ActivateSymptomTemplate, SymptomTemplatesAction, TOGGLE_TEMPLATE_SAVE} from "./templates.actions";
import {symptomTemplatesReducer} from "./templates.reducer";

describe("symptomTemplatesReducer", () => {
  it("ACTIVATE_SYMPTOM_TEMPLATE", () => {
    const state = {...symptomTemplatesInit};
    const action = {
      type: ACTIVATE_SYMPTOM_TEMPLATE,
      data: null
    } as ActivateSymptomTemplate;
    expect(symptomTemplatesReducer(state, action).data).toEqual(null);
  });

  it("TOGGLE_TEMPLATE_SAVE", () => {
    const state = {...symptomTemplatesInit};
    const action = {
      type: TOGGLE_TEMPLATE_SAVE,
      value: true
    } as SymptomTemplatesAction;
    expect(symptomTemplatesReducer(state, action).saving).toEqual(true);
  });

});
