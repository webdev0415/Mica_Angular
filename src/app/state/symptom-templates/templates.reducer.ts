import * as SymptomTemplates from './templates.actions';
import { symptomTemplatesInit } from '../../app.config';

export function symptomTemplatesReducer(state: State.SymptomTemplates = symptomTemplatesInit,
                                        action: SymptomTemplates.SymptomTemplatesAction): State.SymptomTemplates {
    let newState: State.SymptomTemplates;

    switch (action.type) {
      case SymptomTemplates.ACTIVATE_SYMPTOM_TEMPLATE:
        newState = {
          ...state,
          data: (<SymptomTemplates.ActivateSymptomTemplate>action).data
        };
        break;
      case SymptomTemplates.TOGGLE_TEMPLATE_SAVE:
        newState = {
          ...state,
          saving: (<SymptomTemplates.ToggleTemplateSave>action).value
        };
        break;
      default:
        return state;
    }

    return newState;
  }
