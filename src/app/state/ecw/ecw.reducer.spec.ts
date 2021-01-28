import {
  ADD_ECW_VALIDATION_SYMPTOM,
  DELETE_ECW_SYMPTOM,
  REMOVE_ECW_VALIDATION_SYMPTOM,
  SET_ECW_ACTIVE_ILLNESS,
  SET_ECW_PARAMS,
  SET_ECW_VALIDATION_ILLNESS,
  UPSERT_ECW_ILLNESS
} from "./ecw.actions";
import ecwReducer, {mergeCustomizer} from "./ecw.reducer";
import {ecwInit} from "../../app.config";
import * as normalizr from "normalizr";

describe("ecw reducer", () => {

  it("SET_ECW_ACTIVE_ILLNESS", () => {
    const code = "17";
    const state = {...ecwInit} as any;
    const illness = {icd10Code: code};
    Object.assign(state, {active: illness});
    const action = {
      type: SET_ECW_ACTIVE_ILLNESS,
      illness: illness
    };
    const res = ecwReducer(state, action);
    expect(res["active"].icd10Code).toEqual(code);
  });

  it("SET_ECW_ACTIVE_ILLNESS", () => {
    const code = "17";
    const state = {...ecwInit} as any;
    const illness = {icd10Code: code};
    Object.assign(state, {active: illness});
    const action = {
      type: SET_ECW_ACTIVE_ILLNESS,
      illness: {
        icd10Code: "18"
      }
    };
    const res = ecwReducer(state, action);
    expect(res["active"].icd10Code).toEqual("18");
  });

  it("SET_ECW_PARAMS", () => {
    const state = {...ecwInit};
    const page = 1;
    const action = {
      type: SET_ECW_PARAMS,
      params: {
        page: page,
      }
    };
    expect(ecwReducer(state, action)["params"].page).toEqual(page);
  });

  it("UPSERT_ECW_ILLNESS", () => {
    const code = "17";
    const action = {
      type: UPSERT_ECW_ILLNESS,
      IllnessData: {
        idIcd10Code: code
      }
    };
    expect(ecwReducer({...ecwInit}, action).illnesses.values[code]).toBeDefined();
  });

  it("REMOVE_ECW_VALIDATION_SYMPTOM", () => {
    const id = "17";
    const action = {
      type: REMOVE_ECW_VALIDATION_SYMPTOM,
      symptomID: id,
      categoryID: id,
      groupID: id
    };
    const state = {...ecwInit};
    Object.assign(state, {validation: {missingData: {"17": {"17": {symptoms: [id]}}}}});
    expect(ecwReducer(state, action)).toBeDefined();
  });

  it("REMOVE_ECW_VALIDATION_SYMPTOM", () => {
    const id = "17";
    const action = {
      type: REMOVE_ECW_VALIDATION_SYMPTOM,
      symptomID: id,
      categoryID: id,
      groupID: id
    };
    const state = {...ecwInit};
    Object.assign(state, {validation: {missingData: {"17": {"17": {symptoms: [id, 18]}}}}});
    expect(ecwReducer(state, action)).toBeDefined();
  });

  it("REMOVE_ECW_VALIDATION_SYMPTOM", () => {
    const id = "17";
    const action = {
      type: REMOVE_ECW_VALIDATION_SYMPTOM,
      symptomID: id,
      categoryID: id,
      groupID: id
    };
    const state = {...ecwInit};
    Object.assign(state, {validation: {missingData: {"17": {"18": {symptoms: [id, 18]}}}}});
    expect(ecwReducer(state, action)).toBeDefined();
  });

  it("REMOVE_ECW_VALIDATION_SYMPTOM", () => {
    const id = "17";
    const action = {
      type: REMOVE_ECW_VALIDATION_SYMPTOM,
      symptomID: id,
      categoryID: id,
      groupID: id
    };
    const state = {...ecwInit};
    Object.assign(state, {validation: {missingData: null}});
    expect(ecwReducer(state, action)).toBeDefined();
  });

  it("ADD_ECW_VALIDATION_SYMPTOM", () => {
    const code = "17";
    const action = {
      type: ADD_ECW_VALIDATION_SYMPTOM,
      symptomID: code,
      categoryID: code,
      groupID: code
    };
    const illness = {symptomGroups: [{groupID: code, categories: [{categoryID: code, symptoms: [{symptomID: code}]}]}]};
    const missingData = {"17": {"17": {categoryID: code, symptoms: []}}};
    const state = {...ecwInit};
    Object.assign(state, {validation: {missingData: missingData, illness: illness}});
    expect(ecwReducer(state, action)).toBeDefined();
  });

  it("ADD_ECW_VALIDATION_SYMPTOM", () => {
    const code = "17";
    const action = {
      type: ADD_ECW_VALIDATION_SYMPTOM,
      symptomID: "18",
      categoryID: code,
      groupID: code
    };
    const illness = {symptomGroups: [{groupID: code, categories: [{categoryID: code, symptoms: [{symptomID: code}]}]}]};
    const missingData = {"17": {"17": {categoryID: code, symptoms: []}}};
    const state = {...ecwInit};
    Object.assign(state, {validation: {missingData: missingData, illness: illness}});
    expect(ecwReducer(state, action)).toBeDefined();
  });

  it("ADD_ECW_VALIDATION_SYMPTOM", () => {
    const code = "17";
    const action = {
      type: ADD_ECW_VALIDATION_SYMPTOM,
      symptomID: code,
      categoryID: code,
      groupID: code
    };
    const illness = {symptomGroups: [{groupID: code, categories: [{categoryID: code, symptoms: [{symptomID: code}]}]}]};
    const missingData = {"17": {"18": {categoryID: code, symptoms: []}}};
    const state = {...ecwInit};
    Object.assign(state, {validation: {missingData: missingData, illness: illness}});
    expect(ecwReducer(state, action)).toBeDefined();
  });

  it("ADD_ECW_VALIDATION_SYMPTOM", () => {
    const code = "17";
    const action = {
      type: ADD_ECW_VALIDATION_SYMPTOM,
      symptomID: code,
      categoryID: code,
      groupID: code
    };
    const illness = {symptomGroups: [{groupID: code, categories: [{categoryID: code, symptoms: [{symptomID: code}]}]}]};
    const missingData = null;
    const state = {...ecwInit};
    Object.assign(state, {validation: {missingData: missingData, illness: illness}});
    expect(ecwReducer(state, action)).toBeDefined();
  });

  it("DELETE_ECW_SYMPTOM", () => {
    const action = {
      type: DELETE_ECW_SYMPTOM,
      categoryID: "catId",
      symptomID: "sympId"
    };
    const state = {...ecwInit};
    Object.assign(state, {
      illnesses: {
        active: "active",
        values: {
          active: {
            entities: {
              categories: {
                catId: {
                  symptoms: ["sympId"]
                }
              }
            },
            form: {
              idIcd10Code: "code"
            }
          }
        }
      }
    });
    expect(ecwReducer(state, action).illnesses.values["code"]).toBeDefined();
  });

  it("SET_ECW_VALIDATION_ILLNESS", () => {
    const state = {...ecwInit};
    Object.assign(state, {validation: {}});
    const action = {
      type: SET_ECW_VALIDATION_ILLNESS,
      illness: null,
      activeIllness: null
    };
    expect(ecwReducer(state, action).validation.illness).toEqual(null);
  });

  it("SET_ECW_VALIDATION_ILLNESS", () => {
    const state = {...ecwInit};
    Object.assign(state, {validation: {}});
    const action = {
      type: SET_ECW_VALIDATION_ILLNESS,
      illness: {
        symptomGroups: [
          {
            groupID: "groupId",
            categories: [
              {
                categoryID: "catId",
                symptoms: []
              }
            ],
            sections: [{categories: []}]
          }
        ]
      },
      activeIllness: {
        entities: {
          categories: [{categoryID: "catId"}]
        }
      }
    };
    spyOn(normalizr, "normalize").and.returnValue({
      categoryID: "catId",
      symptoms: [],
      entities: {
        categories: {
          "catId": {symptoms: [{}], categoryID: null}
        }
      }
    });
    expect(ecwReducer(state, action).validation.missingData).toBeDefined();
  });

  it("SET_ECW_VALIDATION_ILLNESS", () => {
    const state = {...ecwInit};
    Object.assign(state, {validation: {}});
    const action = {
      type: SET_ECW_VALIDATION_ILLNESS,
      illness: {
        symptomGroups: [
          {
            groupID: "groupId",
            categories: [
              {
                categoryID: "catId",
                symptoms: []
              }
            ],
            sections: [{categories: []}]
          }
        ]
      },
      activeIllness: {
        entities: {
          categories: [{categoryID: "catId"}]
        }
      }
    };
    spyOn(normalizr, "normalize").and.returnValue({
      categoryID: "catId",
      symptoms: [],
      entities: {
        categories: {
          "catId": {symptoms: [{}], categoryID: "catId"}
        }
      }
    });
    expect(ecwReducer(state, action).validation.missingData).toBeDefined();
  });

  it("SET_ECW_VALIDATION_ILLNESS", () => {
    const state = {...ecwInit};
    Object.assign(state, {validation: {}});
    const action = {
      type: SET_ECW_VALIDATION_ILLNESS,
      illness: {
        symptomGroups: [
          {
            groupID: "groupId",
            categories: [
              {
                categoryID: "catId",
                symptoms: []
              }
            ],
            sections: [{categories: []}]
          }
        ]
      },
      activeIllness: {
        entities: {
          categories: [{categoryID: "catId"}]
        }
      }
    };
    spyOn(normalizr, "normalize").and.returnValue({
      categoryID: "catId",
      symptoms: [],
      entities: {
        categories: {
          "catId": {symptoms: [], categoryID: "catId"}
        }
      }
    });
    expect(ecwReducer(state, action).validation.missingData).toBeDefined();
  });

  it("SET_ECW_VALIDATION_ILLNESS", () => {
    const state = {...ecwInit};
    Object.assign(state, {validation: {}});
    const action = {
      type: SET_ECW_VALIDATION_ILLNESS,
      illness: {
        symptomGroups: [
          {
            groupID: "groupId",
            categories: [
              {
                categoryID: "catId",
                symptoms: []
              }
            ],
            sections: [{categories: []}]
          }
        ]
      },
      activeIllness: {
        entities: {
          categories: [{categoryID: "catId"}]
        }
      }
    };
    spyOn(normalizr, "normalize").and.returnValue({
      categoryID: "catId",
      symptoms: [],
      entities: {
        categories: {
          "catId": {symptoms: [], categoryID: "catId2"}
        }
      }
    });
    expect(ecwReducer(state, action).validation.missingData).toBeDefined();
  });

  it("SET_ECW_VALIDATION_ILLNESS", () => {
    const state = {...ecwInit};
    Object.assign(state, {validation: {}});
    const action = {
      type: SET_ECW_VALIDATION_ILLNESS,
      illness: {
        symptomGroups: [
          {
            groupID: "groupId",
            categories: null,
            sections: [{categories: []}]
          }
        ]
      },
      activeIllness: {
        entities: {
          categories: [{categoryID: "catId"}]
        }
      }
    };
    spyOn(normalizr, "normalize").and.returnValue({
      categoryID: "catId",
      symptoms: [],
      entities: {
        categories: {
          "catId": {symptoms: [], categoryID: "catId2"}
        }
      }
    });
    expect(ecwReducer(state, action).validation.missingData).toBeDefined();
  });

  it("SET_ECW_VALIDATION_ILLNESS", () => {
    const state = {...ecwInit};
    Object.assign(state, {validation: {}});
    const ecwIllness = null;
    const activeIllness = {};
    const nlpIllness = {
      symptomGroups: []
    };
    const action = {
      type: SET_ECW_VALIDATION_ILLNESS,
      ecwIllness,
      activeIllness,
      nlpIllness
    };
    expect(ecwReducer(state, action).validation.missingData).toEqual(null);
  });

  it("SET_ECW_VALIDATION_ILLNESS", () => {
    const state = {...ecwInit};
    Object.assign(state, {validation: {}});
    const ecwIllness = null;
    const activeIllness = {
      entities: {
        categories: [
          {
            categoryID: "catId",
            symptoms: [{
              symptomID: "symptomId"
            }]
          }
        ]
      }
    };
    const nlpIllness = {
      symptomGroups: [{
        categories: [
          {
            categoryID: "catId"
          }
        ],
        sections: [
          {
            categories: []
          }
        ]
      }]
    };
    const action = {
      type: SET_ECW_VALIDATION_ILLNESS,
      ecwIllness,
      activeIllness,
      nlpIllness
    };
    spyOn(normalizr, "normalize").and.returnValue({
      entities: {
        categories: {
          catId: {
            categoryID: "catId",
            symptoms: [{
              symptomID: "sympId"
            }]
          }
        }
      }
    });
    expect(ecwReducer(state, action).validation.missingData).toBeDefined();
  });

  it("SET_ECW_VALIDATION_ILLNESS", () => {
    const state = {...ecwInit};
    Object.assign(state, {validation: {}});
    const ecwIllness = null;
    const symptom = {symptomID: "symptomId"};
    const activeIllness = {
      entities: {
        categories: [
          {
            categoryID: "catId",
            symptoms: [symptom]
          }
        ]
      }
    };
    const nlpIllness = {
      symptomGroups: [{
        categories: [
          {
            categoryID: "catId"
          }
        ],
        sections: [
          {
            categories: []
          }
        ]
      }]
    };
    const action = {
      type: SET_ECW_VALIDATION_ILLNESS,
      ecwIllness,
      activeIllness,
      nlpIllness
    };
    spyOn(normalizr, "normalize").and.returnValue({
      entities: {
        categories: {
          catId: {
            categoryID: "catId",
            symptoms: [symptom]
          }
        }
      }
    });
    expect(ecwReducer(state, action).validation.missingData).toBeDefined();
  });

  it("SET_ECW_VALIDATION_ILLNESS", () => {
    const state = {...ecwInit};
    Object.assign(state, {validation: {}});
    const ecwIllness = null;
    const symptom = {symptomID: "symptomId"};
    const activeIllness = {
      entities: {
        categories: [
          {
            categoryID: "catId",
            symptoms: [symptom]
          }
        ]
      }
    };
    const nlpIllness = {
      symptomGroups: [{
        categories: [
          {
            categoryID: "catId"
          }
        ],
        sections: [
          {
            categories: []
          }
        ]
      }]
    };
    const action = {
      type: SET_ECW_VALIDATION_ILLNESS,
      ecwIllness,
      activeIllness,
      nlpIllness
    };
    spyOn(normalizr, "normalize").and.returnValue({
      entities: {
        categories: {
          catId: {
            categoryID: "categoryId",
            symptoms: [symptom]
          }
        }
      }
    });
    expect(ecwReducer(state, action).validation.missingData).toBeDefined();
  });

  it("SET_ECW_VALIDATION_ILLNESS", () => {
    const state = {...ecwInit};
    Object.assign(state, {validation: {}});
    const ecwIllness = null;
    const symptom = {symptomID: "symptomId"};
    const activeIllness = {
      entities: {
        categories: [
          {
            categoryID: "catId",
            symptoms: [symptom]
          }
        ]
      }
    };
    const nlpIllness = {
      symptomGroups: [{
        categories: [
          {
            categoryID: "catId"
          }
        ],
        sections: [
          {
            categories: []
          }
        ]
      }]
    };
    const action = {
      type: SET_ECW_VALIDATION_ILLNESS,
      ecwIllness,
      activeIllness,
      nlpIllness
    };
    spyOn(normalizr, "normalize").and.returnValue({
      entities: {
        categories: {
          catId: {
            categoryID: "categoryId",
            symptoms: []
          }
        }
      }
    });
    expect(ecwReducer(state, action).validation.missingData).toBeDefined();
  });

  it("SET_ECW_VALIDATION_ILLNESS", () => {
    const state = {...ecwInit};
    Object.assign(state, {validation: {}});
    const ecwIllness = null;
    const symptom = {symptomID: "symptomId"};
    const activeIllness = {
      entities: {
        categories: [
          {
            categoryID: "catId",
            symptoms: [symptom]
          }
        ]
      }
    };
    const nlpIllness = {
      symptomGroups: [{
        categories: null,
        sections: [
          {
            categories: []
          }
        ]
      }]
    };
    const action = {
      type: SET_ECW_VALIDATION_ILLNESS,
      ecwIllness,
      activeIllness,
      nlpIllness
    };
    spyOn(normalizr, "normalize").and.returnValue({
      entities: {
        categories: {
          catId: {
            categoryID: "categoryId",
            symptoms: []
          }
        }
      }
    });
    expect(ecwReducer(state, action).validation.missingData).toBeDefined();
  });

  it("mergeCustomizer", () => {
    const objectA = [1, 2, 3];
    const objectB = [1];
    expect(mergeCustomizer(objectA, objectB).length).toEqual(3);
  });

  it("mergeCustomizer", () => {
    const objectA = {};
    const objectB = {};
    expect(mergeCustomizer(objectA, objectB)).toBeUndefined();
  });

});
