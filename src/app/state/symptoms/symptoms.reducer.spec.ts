import {symptomsReducer} from "./symptoms.reducer";
import {symptomsInit} from "../../app.config";
import {
  SET_MULTIPLIER_DATA,
  SET_SYMPTOM_DEFINITION,
  SET_SYMPTOMS_DATA,
  setNlpSymptoms,
  resetNlpSymptoms,
} from "./symptoms.actions";
import * as normalizr from "normalizr";

describe("symptoms reducer", () => {
  it("SET_MULTIPLIER_DATA", () => {
    const state = {...symptomsInit};
    const action = {
      type: SET_MULTIPLIER_DATA,
      key: "key",
      values: [{name: "name"}]
    };
    expect(symptomsReducer(state, action).multiplier.typeahead["key"].length).toEqual(1);
  });

  it("SET_SYMPTOMS_DATA", () => {
    const state = {...symptomsInit};
    const action = {
      type: SET_SYMPTOMS_DATA,
      data: {}
    };
    spyOn(normalizr, "normalize").and.returnValue({
      entities: {
        categories: {},
        sections: {},
        entities: {},
        symptoms: {}
      }
    });
    expect(symptomsReducer(state, action)).toBeDefined();
  });

  it("SET_SYMPTOM_DEFINITION", () => {
     const state = {...symptomsInit};
     const action = {
       type: SET_SYMPTOM_DEFINITION,
       values: [
         {
           code: "code",
           definition: "definition"
         }
       ]
     };
     expect(symptomsReducer(state, action)).toBeDefined();
  });

  it("setNlpSymptoms", () => {
    const action = setNlpSymptoms([{code: "code"}], 1, 1);
    const state = {...symptomsInit};
    expect(symptomsReducer(state, action).nlpSymptoms.currentSearch.length).toEqual(1);
  });

  it("resetNlpSymptoms", () => {
    const action = resetNlpSymptoms();
    const state = {...symptomsInit};
    Object.assign(state, {nlpSymptoms: {
      currentSearch: [{}, {}]
    }})
    expect(symptomsReducer(state, action).nlpSymptoms.currentSearch.length).toBe(0);
  });

});
