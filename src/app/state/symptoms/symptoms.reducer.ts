import { Symptoms } from "./symptoms";
import * as SymptomsActions from "./symptoms.actions";
import * as _ from "lodash";
import { symptomsInit } from "../../app.config";
import { symptomGroupSchema } from "../denormalized.model";
import { normalize } from "normalizr";
import { combineReducers, Reducer } from "redux";

const multiplier =
  (state: State.MultiplierState = symptomsInit.multiplier,
  action: Symptoms.Actions.SymptomsAction): State.MultiplierState => {
  switch (action.type) {
    case SymptomsActions.SET_MULTIPLIER_DATA:
      const key = (<Symptoms.Actions.SetMultiplierSearch>action).key;
      const refValues = (<Symptoms.Actions.SetMultiplierSearch>action).values;
      return {...state, typeahead: {...state.typeahead, [key]: refValues}};
    default:
      return state;
  }
};

const nlpSymptoms = (
  state: State.NlpSymptoms = symptomsInit.nlpSymptoms,
  action: Symptoms.Actions.SymptomsAction
): State.NlpSymptoms => {
  switch (action.type) {
    case SymptomsActions.SET_NLP_SYMPTOMS: {
      const {symptoms, page, total} = (<Symptoms.Actions.SetNlpSymptoms>action);
      const ss = symptoms.map(s => ({...s, symptomID: s.code}));
      const objSympts = Object.assign({}, ...ss.map(s => ({[s.symptomID]: s})))
      return {
        ...state,
        currentSearch: ss,
        cachedSymptoms: {...state.cachedSymptoms, ...objSympts},
        page,
        total,
      };
    }
    case SymptomsActions.RESET_NLP_SYMPTOMS: {
      return symptomsInit.nlpSymptoms
    }
    default: {
      return state;
    }
  }
};

const entities =
  (state: Workbench.Normalized.Entities = symptomsInit.entities,
  action: Symptoms.Actions.SymptomsAction): Workbench.Normalized.Entities => {
  switch (action.type) {
    case SymptomsActions.SET_SYMPTOMS_DATA:
      const data = (<Symptoms.Actions.SetSymptomGroup>action).data;
      const denormalized = normalize(data, symptomGroupSchema);
      return {
        categories: _.merge(state.categories, denormalized.entities.categories),
        sections: _.merge(state.sections, denormalized.entities.sections),
        symptomGroups: _.merge(state.symptomGroups, denormalized.entities.symptomGroups),
        symptoms: _.merge(state.symptoms, denormalized.entities.symptoms)
      };

    case SymptomsActions.SET_SYMPTOM_DEFINITION:
      let newState = {...state};
      const values = (<Symptoms.Actions.SetSymptomDefinition>action).values;
      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        newState = {
          ...newState,
          symptoms: {
            ...newState.symptoms,
            [value.code]: {...newState.symptoms[value.code], definition: value.definition}
          }
        }
      }
      return newState as Workbench.Normalized.Entities;

    default:
      return state;
  }
};

const bodySelectorMultipliers = (state: string[] = symptomsInit.bodySelectorMultipliers) => state;

export const symptomsReducer: Reducer<State.Symptoms> = combineReducers<State.Symptoms>({
  entities,
  multiplier,
  bodySelectorMultipliers,
  nlpSymptoms
});
