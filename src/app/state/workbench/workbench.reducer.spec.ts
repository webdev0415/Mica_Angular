import {workbenchInit} from "../../app.config";
import workbenchReducer from "./workbench.reducer";
import {
  DELETE_ILLNESS, DELETE_MANDATORY_SYMPTOM,
  DELETE_SYMPTOM,
  EDIT_READ_ONLY_ILLNESS, INSERT_SYMPTOM, SAVE_SYMPTOM,
  SET_ACTIVE_ILLNESS,
  SET_ILLNESS_ERROR, SET_MANDATORY_SYMPTOM,
  SET_READONLY_ILLNESS, SET_SG_COMPLETE_STATUS,
  SET_SYMPTOM_ERROR, SET_MANY_SYMPTOM_ERRORS,
  UPSERT_ILLNESS, UPSERT_ILLNESS_NORM
} from "./workbench.actions";
import * as denormalizedModel from "../denormalized.model";
import * as illnessUtil from "../../util/data/illness";
import {mandatorySymptoms} from "./workbench.selectors";

describe("workbench reducer", () => {
  it("SET_READONLY_ILLNESS", () => {
    const state = {...workbenchInit};
    const errors = {};
    Object.assign(state, {errors});
    const action = {
      type: SET_ACTIVE_ILLNESS
    };
    expect(workbenchReducer(state, action).errors.illness).toEqual({});
  });
  it("SET_READONLY_ILLNESS", () => {
    const state = {...workbenchInit};
    Object.assign(state, {errors: {}, illnesses: {values: {"codev1": {}}, active: "codev1"}});
    const action = {
      type: SET_ACTIVE_ILLNESS,
      taskId: 1,
      idIcd10Code: "code",
      version: 1
    };
    expect(workbenchReducer(state, action).illnesses.activeTaskId).toEqual(1);
  });

  it("UPSERT_ILLNESS_NORM", () => {
    const state = {...workbenchInit};
    Object.assign(state, {
      illnesses: {values: {}}
    });
    const action = {
      type: UPSERT_ILLNESS_NORM,
      value: {
        form: {
          idIcd10Code: "code",
          version: 1
        }
      }
    };
    expect(workbenchReducer(state, action).illnesses.values["codev1"]).toBeDefined();
  });

  it("UPSERT_ILLNESS", () => {
    const action = {
      type: UPSERT_ILLNESS,
      formValue: {
        idIcd10Code: "code",
        name: "name",
        version: 1,
        state: "STATE"
      }
    };
    const state = {...workbenchInit};
    Object.assign(state, {
      illnesses: {}
    });
    expect(workbenchReducer(state, action).illnesses.values["codev1"]).toBeDefined();
  });

  it("SET_ILLNESS_ERROR", () => {
    const state = {...workbenchInit};
    const errors = {};
    Object.assign(state, {errors});
    const action = {
      type: SET_ILLNESS_ERROR,
      error: errors
    };
    expect(workbenchReducer(state, action).errors.illness).toEqual(errors as any);
  });

  it("SET_SG_COMPLETE_STATUS", () => {
     const action = {
       type: SET_SG_COMPLETE_STATUS,
       value: true,
       groupID: "group"
     };
     const state = {...workbenchInit};
     Object.assign(state, {
       illnesses: {
         values: {
           activeValue: {
              form: {
                groupsComplete: []
              }
           }
         },
         active: "activeValue"
       }
     });
     expect(workbenchReducer(state, action).illnesses.values).toBeDefined();
  });

  it("SET_SG_COMPLETE_STATUS", () => {
     const action = {
       type: SET_SG_COMPLETE_STATUS,
       value: false,
       groupID: "group"
     };
     const state = {...workbenchInit};
     Object.assign(state, {
       illnesses: {
         values: {
           activeValue: {
              form: {
                groupsComplete: ["group"]
              }
           }
         },
         active: "activeValue"
       }
     });
     expect(workbenchReducer(state, action).illnesses.values).toBeDefined();
  });

  it("DELETE_ILLNESS", () => {
    const state = {...workbenchInit};
    Object.assign(state, {
      illnesses: {values: {"codev1": {}}, active: "codev1"}
    });
    const action = {
      type: DELETE_ILLNESS,
      illness: "code",
      version: 1
    };
    expect(workbenchReducer(state, action).illnesses.active).toEqual("");
  });

  it("DELETE_ILLNESS", () => {
    const state = {...workbenchInit};
    Object.assign(state, {
      illnesses: {values: {"codev1": {}}, active: "codev2"}
    });
    const action = {
      type: DELETE_ILLNESS,
      illness: "code",
      version: 1
    };
    expect(workbenchReducer(state, action).illnesses.active).toEqual("codev2");
  });

  it("SAVE_SYMPTOM", () => {
    const action = {
      type: SAVE_SYMPTOM,
      value: {
        symptomID: "id"
      }
    };
    const state = {...workbenchInit};
    Object.assign(state, {
      illnesses: {
        active: "activeValue",
        values: {
          activeValue: {
            form: {
              idIcd10Code: "code",
              version: 1
            },
            entities: {
              symptoms: {}
            }
          }
        }
      }
    });
    expect(workbenchReducer(state, action).illnesses.values["codev1"]).toBeDefined();
  });

  it("SET_SYMPTOM_ERROR", () => {
    const state = {...workbenchInit};
    const error = {
      groupID: "id",
      bodyParts: null,
      rowErrors: null,
      symptomID: "symptomId"
    };
    Object.assign(state, {errors: {
      symptoms: {
        "id": [{
          symptomID: "symptomId",
          bodyParts: {part: {}},
          rowErrors: [{index: 1}],
        }]
      }
      }});
    const action = {
      type: SET_SYMPTOM_ERROR,
      error: error
    };
    expect(workbenchReducer(state, action).errors.symptoms["id"].length).toBe(1);

  });

  it("SET_MANY_SYMPTOM_ERRORS", () => {
    const state = {...workbenchInit};
    const errors = [
      { groupID: "general", bodyParts: null, rowErrors: [{index: 1}], symptomID: "symptomId1" },
      { groupID: "general", bodyParts: null, rowErrors: [{index: 1}], symptomID: "symptomId2" },
    ];
    Object.assign(state, {errors: {
      symptoms: {
        "id": [{
          symptomID: "symptomId",
          bodyParts: {part: {}},
          rowErrors: [{index: 1}],
        }]
      }
    }});
    const action = {
      type: SET_MANY_SYMPTOM_ERRORS,
      errors: errors
    };
    expect(workbenchReducer(state, action).errors.symptoms["general"].length).toEqual(2);
  });

  it("DELETE_SYMPTOM", () => {
    const s = {...workbenchInit};
    const action = {
      type: DELETE_SYMPTOM,
      path: {
        symptomGroup: "group",
        categoryID: "category"
      },
      symptomID: "symptom"
    };
    Object.assign(s, {
      errors: {
        symptoms: {
          "group": []
        }
      },
      illnesses: {
        values: {
          active: {
            entities: {
              symptomGroups: {
              },
              categories: {
                category: {
                  symptoms: []
                }
              }
            },
            form: {
              idIcd10Code: "code",
              version: 1
            }
          }
        },
        active: "active"
      }
    });
    expect(workbenchReducer(s, action).errors.symptoms["group"].length).toEqual(0);
  });

  it("DELETE_SYMPTOM", () => {
    const s = {...workbenchInit};
    const action = {
      type: DELETE_SYMPTOM,
      path: {
        symptomGroup: "group",
        categoryID: "category",
        symptomID: "s"
      },
      symptomID: "symptom"
    };
    Object.assign(s, {
      errors: {
        symptoms: {
          "group": [{symptomID: "s"}]
        }
      },
      illnesses: {
        values: {
          active: {
            entities: {
              symptomGroups: {
              },
              categories: {
                category: {
                  symptoms: []
                }
              }
            },
            form: {
              idIcd10Code: "code",
              version: 1
            }
          }
        },
        active: "active"
      }
    });
    expect(workbenchReducer(s, action).errors.symptoms).toEqual({});
  });

  it("DELETE_SYMPTOM", () => {
    const s = {...workbenchInit};
    const action = {
      type: DELETE_SYMPTOM,
      path: {
        symptomGroup: "group",
        categoryID: "category",
        symptomID: "s"
      },
      symptomID: "symptom"
    };
    Object.assign(s, {
      errors: {
        symptoms: {
          "group": [{symptomID: "s"}, {symptomID: "symptom"}]
        }
      },
      illnesses: {
        values: {
          active: {
            entities: {
              symptomGroups: {
              },
              categories: {
                category: {
                  symptoms: []
                }
              }
            },
            form: {
              idIcd10Code: "code",
              version: 1
            }
          }
        },
        active: "active"
      }
    });
    expect(workbenchReducer(s, action).errors.symptoms).not.toEqual({});
  });

  it("SET_READONLY_ILLNESS", () => {
    const action = {
      type: SET_READONLY_ILLNESS,
      illness: null
    };
    const state = {...workbenchInit};
    Object.assign(state, {
      readOnlyIllness: {}
    });
    expect(workbenchReducer(state, action).readOnlyIllness).toEqual(null);
  });

  it("SET_READONLY_ILLNESS", () => {
    const action = {
      type: SET_READONLY_ILLNESS,
      illness: {}
    };
    const state = {...workbenchInit};
    Object.assign(state, {
      readOnlyIllness: {}
    });
    spyOn(denormalizedModel, "normalizeIllness").and.returnValue({});
    expect(workbenchReducer(state, action).readOnlyIllness).toEqual({} as any);
  });

  it("EDIT_READ_ONLY_ILLNESS", () => {
    const action = {
      type: EDIT_READ_ONLY_ILLNESS,
      stateRoot: {
        workbench: {
          readOnlyIllness: null
        }
      }
    };
    const state = {...workbenchInit};
    Object.assign(state, {readOnlyIllness: {}, illnesses: {}});
    expect(workbenchReducer(state, action).readOnlyIllness).toEqual(null);
    expect(workbenchReducer(state, action).illnesses).toEqual({} as any);
  });

  it("EDIT_READ_ONLY_ILLNESS", () => {
    const action = {
      type: EDIT_READ_ONLY_ILLNESS,
      stateRoot: {
        workbench: {
          readOnlyIllness: {
            form: {
              idIcd10Code: "code",
              version: 1
            }
          }
        }
      }
    };
    const state = {...workbenchInit};
    Object.assign(state, {readOnlyIllness: {}, illnesses: {values: {}}});
    expect(workbenchReducer(state, action).readOnlyIllness).toEqual(null);
    expect(workbenchReducer(state, action).illnesses.values["codev1"]).toBeDefined();
  });

  it("INSERT_SYMPTOM", () => {
    const action = {
      value: {
        symptomID: "sympId"
      },
      type: INSERT_SYMPTOM,
      path: {
        symptomGroup: "group",
        sectionID: "sectionId",
        categoryID: "catId"
      }
    };
    const state = {...workbenchInit};
    Object.assign(state, {
      illnesses: {
        values: {
          "activeIllness": {
            entities: {
              categories: {
              },
              sections: {
              },
              symptomGroups: {}
            },
            form: {
              symptomGroups: []
            }
          }
        },
        active: "activeIllness"
      }
    });
    spyOn(illnessUtil, "symptomGroupValueFactory").and.returnValue({
      categories: []
    });
    expect(workbenchReducer(state, action).illnesses).toBeDefined();
  });

  it("INSERT_SYMPTOM", () => {
    const action = {
      value: {
        symptomID: "sympId"
      },
      type: INSERT_SYMPTOM,
      path: {
        symptomGroup: "group",
        sectionID: null,
        categoryID: "catId"
      }
    };
    const state = {...workbenchInit};
    Object.assign(state, {
      illnesses: {
        values: {
          "activeIllness": {
            entities: {
              categories: {
                "catId": {}
              },
              sections: {
              },
              symptomGroups: {"group": {}}
            },
            form: {
              symptomGroups: []
            }
          }
        },
        active: "activeIllness"
      }
    });
    spyOn(illnessUtil, "symptomGroupValueFactory").and.returnValue({
      categories: []
    });
    expect(workbenchReducer(state, action).illnesses).toBeDefined();
  });

  it("SET_MANDATORY_SYMPTOM", () => {
    const action = {
      type: SET_MANDATORY_SYMPTOM,
      groupID: "groupId",
      simptomID: "symptomId",
      basicSymptomID: "basicSymptomId"
    };
    const s = {...workbenchInit};
    const mandatorySymptomsState = {
      "groupId": {
        "symptomId": {
        }
      }
    };
    Object.assign(s, {
      mandatorySymptoms: mandatorySymptomsState
    });
    expect(workbenchReducer(s, action as any).mandatorySymptoms).toEqual(mandatorySymptomsState as any);
  });

  it("SET_MANDATORY_SYMPTOM", () => {
    const action = {
      type: SET_MANDATORY_SYMPTOM,
      groupID: "groupId",
      simptomID: "symptomId",
      basicSymptomID: "basicSymptomId"
    };
    const s = {...workbenchInit};
    const mandatorySymptomsState = {
      "group": {
        "symptomId": {
        }
      }
    };
    Object.assign(s, {
      mandatorySymptoms: mandatorySymptomsState
    });
    expect(workbenchReducer(s, action as any).mandatorySymptoms).not.toEqual(mandatorySymptomsState as any);
  });

  it("DELETE_MANDATORY_SYMPTOM", () => {
    const action = {
      type: DELETE_MANDATORY_SYMPTOM,
      groupID: "groupId",
      simptomID: "symptomId",
    };
    const s = {...workbenchInit};
    const mandatorySymptomsState = {
      "groupId": {
        "symptoms": {}
      }
    };
    Object.assign(s, {
      mandatorySymptoms: mandatorySymptomsState
    });
    expect(workbenchReducer(s, action as any).mandatorySymptoms).toEqual(mandatorySymptomsState as any);
  });

  it("DELETE_MANDATORY_SYMPTOM", () => {
    const action = {
      type: DELETE_MANDATORY_SYMPTOM,
      groupID: "groupId",
      simptomID: "symptomId",
    };
    const s = {...workbenchInit};
    const mandatorySymptomsState = {
      "groupId": {
        "symptomId": {}
      }
    };
    Object.assign(s, {
      mandatorySymptoms: mandatorySymptomsState
    });
    expect(workbenchReducer(s, action as any).mandatorySymptoms).toEqual({});
  });

  it("DELETE_MANDATORY_SYMPTOM", () => {
    const action = {
      type: DELETE_MANDATORY_SYMPTOM,
      groupID: "groupId",
      simptomID: "symptomId",
    };
    const s = {...workbenchInit};
    const mandatorySymptomsState = {
      "groupId": {
        "symptomId": {},
        "symptom": {}
      }
    };
    Object.assign(s, {
      mandatorySymptoms: mandatorySymptomsState
    });
    expect(workbenchReducer(s, action as any).mandatorySymptoms).not.toEqual({});
  });

});
