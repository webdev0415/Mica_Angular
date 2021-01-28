import { defaultState } from "../../app.config";
import * as denormalizedModel from "../denormalized.model";
import {
  activeIllnessValue,
  activeIllnessValueDenorm,
  illnessValue,
  illnessInconsistentMsgs,
  illnessValues,
  symptomGroupsCompleteValue,
  isSymptomGroupComplete,
  isSymptomGroupActiveComplete,
  areSymptomGroupsComplete,
  symptomGroupValues,
  symptomGroupValue,
  isActiveIllnessHasSymptoms,
  isActiveIllnessValid,
  isActiveSymptomGroupValid,
  symptomsInCatValue,
  symptomsInCatIDs,
  symptomValue,
  categoryValue,
  catValueAll,
  activeCategoryValue,
  sectionCatsValue,
  activeSectionCatsValue,
  sectionCatsIDs,
  sectionValue,
  activeSymptomGroupValue,
  symptomGroupCatValue,
  mandatorySymptoms,
  currentIllness,
  activeMandatorySymptoms,
  hasMissingMandatorySymptoms,
  activeSymptomGroupHasAnySymptoms,
  readOnlyIllnessID
} from "./workbench.selectors";
import * as symptomsSelectors from "../symptoms/symptoms.selectors";
import * as workbenchSelectors from "../workbench/workbench.selectors";
import * as validators from "app/util/forms/validators";
import * as ecwSelectors from "../ecw/ecw.selectors";
import * as navSelectors from "../nav/nav.selectors";
import {
  DELETE_MANDATORY_SYMPTOM,
  deleteMandatorySymptom,
  SET_MANDATORY_SYMPTOM,
  setMandatorySymptom
} from "./workbench.actions";

describe("workbench selectors", () => {

  it("activeIllnessValueDenorm", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: {},
        illnesses: {
          active: "A",
          values: {}
        }
      }
    });
    spyOn(denormalizedModel, "denormalizeIllnessValue").and.callFake(() => {return {}});
    expect(activeIllnessValueDenorm(state)).toEqual({} as any);
  });

  it("activeIllnessValueDenorm", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {}
        }
      }
    });
    spyOn(denormalizedModel, "denormalizeIllnessValue").and.callFake(() => {return {}});
    expect(activeIllnessValueDenorm(state)).toEqual({} as any);
  });

  it("activeIllnessValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: {},
        illnesses: {
          active: "A",
          values: {}
        }
      }
    });
    expect(activeIllnessValue(state)).toEqual({} as any);
  });

  it("activeIllnessValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {"A": {}}
        }
      }
    });
    expect(activeIllnessValue(state)).toEqual({} as any);
  });

  it("illnessValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: {},
        illnesses: {
          values: {"Av1": {}}
        }
      }
    });
    expect(illnessValue("A", 1)(state)).toEqual({} as any);
  });

  it("illnessValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: {
          form: {
            idIcd10Code: "A",
            version: 1
          }
        },
        illnesses: {
          values: {"Av2": {}}
        }
      }
    });
    expect(illnessValue("A", 1)(state)).not.toEqual({} as any);
  });

  it("illnessValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: {
          form: {
            idIcd10Code: "A",
            version: 2
          }
        },
        illnesses: {
          values: {"Av2": {}}
        }
      }
    });
    expect(illnessValue("A", 1)(state)).toBeUndefined();
  });

  it("illnessInconsistentMsgs", () => {
    const inconsistentModelSpy = spyOn(validators, "inconsistentModelMsgs").and.callFake(() => {});

    spyOn(symptomsSelectors, "entities").and.returnValue({});
    spyOn(workbenchSelectors, "illnessValue").and.returnValue(() => ({}));
    illnessInconsistentMsgs("A", 1)({ ...defaultState });
    expect(inconsistentModelSpy).toHaveBeenCalledWith({}, {});
  });

  it("illnessInconsistentMsgs", () => {
    const inconsistentModelSpy = spyOn(validators, "inconsistentModelMsgs").and.callFake(() => {});

    spyOn(symptomsSelectors, "entities").and.returnValue({});
    spyOn(workbenchSelectors, "illnessValue").and.returnValue(() => null);
    expect(illnessInconsistentMsgs("A", 1)({...defaultState})).toEqual([]);
    expect(inconsistentModelSpy).not.toHaveBeenCalled();
  });

  it("illnessValues", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        illnesses: {
          values: {
            "A": {},
            "B": {}
          }
        }
      }
    });
    expect(illnessValues(state).length).toEqual(2);
  });

  it("symptomGroupsCompleteValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": null
          }
        }
      }
    });
    expect(symptomGroupsCompleteValue(state)).toEqual([]);
  });

  it("symptomGroupsCompleteValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": {form: {groupsComplete: ["group"]}}
          }
        }
      }
    });
    expect(symptomGroupsCompleteValue(state).length).toEqual(1);
  });

  it("isSymptomGroupComplete", () => {
    const state = {...defaultState};
    const group = "group";
    Object.assign(state, {
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": {form: {groupsComplete: [group]}}
          }
        }
      }
    });
    spyOn(ecwSelectors, "ecwValidationIsSgInvalid").and.returnValue(() => false);
    expect(isSymptomGroupComplete(group)(state)).toBeTruthy();
  });

  it("isSymptomGroupActiveComplete", () => {
    const state = {...defaultState};
    const group = "group";
    Object.assign(state, {
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": {form: {groupsComplete: [group]}}
          }
        }
      }
    });
    spyOn(navSelectors, "activeSymptomGroup").and.returnValue(() => group);
    expect(isSymptomGroupActiveComplete(state)).toBeFalsy();
  });

  it("areSymptomGroupsComplete", () => {
    const state = {...defaultState};
    Object.assign(state, {
      nav: {
        symptomItems: [
          {
            name: "name/name"
          }
        ]
      },
      workbench: {
        readOnlyIllness: {
          form: {
            groupsComplete: ["group"]
          }
        },
        illnesses: {
          active: "A",
          values: {
          }
        }
      }
    });
    expect(areSymptomGroupsComplete(state)).toBeFalsy();
  });

  it("areSymptomGroupsComplete", () => {
    const state = {...defaultState};
    Object.assign(state, {
      nav: {
        symptomItems: [
          {
            name: "name/name"
          }
        ]
      },
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": null
          }
        }
      }
    });
    expect(areSymptomGroupsComplete(state)).toBeFalsy();
  });

  it("symptomGroupValues", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: {
          entities: {
            symptomGroups: {
              "A": {},
              "B": {}
            }
          }
        },
        illnesses: {
          active: "A",
          values: {
            "A": null
          }
        }
      }
    });
    expect(symptomGroupValues(state).length).toEqual(2);
  });

  it("symptomGroupValues", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": null
          }
        }
      }
    });
    expect(symptomGroupValues(state).length).toEqual(0);
  });

  it("symptomGroupValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": null
          }
        }
      }
    });
    expect(symptomGroupValue("group")(state)).toBeUndefined();
  });

  it("symptomGroupValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: {
          entities: {
            symptomGroups: {
              "group": {}
            }
          }
        },
        illnesses: {
          active: "A",
          values: {
            "A": null
          }
        }
      }
    });
    expect(symptomGroupValue("group")(state)).toEqual({} as any);
  });

  it("isActiveIllnessHasSymptoms", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": null
          }
        }
      }
    });
    expect(isActiveIllnessHasSymptoms(state)).toBeUndefined();
  });

  it("isActiveIllnessValid", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        errors: {
          illness: {},
          symptoms: {}
        }
      }
    });
    expect(isActiveIllnessValid(state)).toBeTruthy();
  });

  it("symptomsInCatValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": {
              entities: {
                symptoms: {
                  "1": {}
                }
              }
            }
          }
        }
      }
    });
    spyOn(workbenchSelectors, "categoryValue").and.returnValue(() => {
      return {
        symptoms: [
          "1"
        ]
      }
    });
    expect(symptomsInCatValue("cat")(state).length).toEqual(1);
  });

  it("symptomsInCatValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": null
          }
        }
      }
    });
    spyOn(workbenchSelectors, "categoryValue").and.returnValue(() => null);
    expect(symptomsInCatValue("cat")(state).length).toEqual(0);
  });

  it("symptomsInCatIDs ", () => {
    spyOn(workbenchSelectors, "categoryValue").and.returnValue(() => {
      return {symptoms: []}
    });
    expect(symptomsInCatIDs("cat")({...defaultState})).toEqual([]);
  });

  it("symptomValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": null
          }
        }
      }
    });
    expect(symptomValue("symptomID")(state)).toBeUndefined();
  });

  it("categoryValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": null
          }
        }
      }
    });
    expect(categoryValue("catID")(state)).toBeUndefined();
  });

  it("catValueAll", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": {
              entities: {
                categories: {
                  "cat1": {},
                  "cat2": {}
                }
              }
            }
          }
        }
      }
    });
    expect(catValueAll(state).length).toEqual(2);
  });

  it("catValueAll", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": null
          }
        }
      }
    });
    expect(catValueAll(state).length).toEqual(0);
  });

  it("activeCategoryValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": null
          }
        }
      }
    });
    expect(activeCategoryValue("catID")(state)).toBeUndefined();
  });

  it("activeCategoryValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": {
              entities: {
                categories: {
                  "1": {}
                }
              }
            }
          }
        }
      }
    });
    expect(activeCategoryValue("1")(state)).toEqual({} as any);
  });

  it("sectionCatsValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": null
          }
        }
      }
    });
    spyOn(workbenchSelectors, "sectionValue").and.returnValue(() => null);
    expect(sectionCatsValue("1")(state)).toEqual([]);
  });

  it("sectionCatsValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": {}
          }
        }
      }
    });
    spyOn(workbenchSelectors, "sectionValue").and.returnValue(() => null);
    expect(sectionCatsValue("1")(state)).toEqual([]);
  });

  it("sectionCatsValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": {
              entities: {
                categories: {
                  1: {}
                }
              }
            }
          }
        }
      }
    });
    spyOn(workbenchSelectors, "sectionValue").and.returnValue(() => {return {categories: [1]}});
    expect(sectionCatsValue("1")(state).length).toEqual(1);
  });

  it("activeSectionCatsValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": null
          }
        }
      }
    });
    expect(activeSectionCatsValue(state)).toEqual([]);
  });

  it("activeSectionCatsValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      nav: {
        activeSection: 2
      },
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": {
              entities: {
                sections: {
                  1: {}
                }
              }
            }
          }
        }
      }
    });
    expect(activeSectionCatsValue(state)).toEqual([]);
  });

  it("activeSectionCatsValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      nav: {
        activeSection: 1
      },
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": {
              entities: {
                sections: {
                  1: {
                    categories: [1]
                  }
                },
                categories: {
                  1: {}
                }
              }
            }
          }
        }
      }
    });
    expect(activeSectionCatsValue(state).length).toEqual(1);
  });

  it("sectionCatsIDs", () => {
    const s = {...defaultState};
    spyOn(workbenchSelectors, "sectionValue").and.returnValue(() => null);
    expect(sectionCatsIDs("section")(s)).toEqual([]);
  });

  it("sectionCatsIDs", () => {
    const s = {...defaultState};
    spyOn(workbenchSelectors, "sectionValue").and.returnValue(() => {return {categories: []}});
    expect(sectionCatsIDs("section")(s)).toEqual([]);
  });

  it("sectionValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": null
          }
        }
      }
    });
    expect(sectionValue("section")(state)).toBeUndefined();
  });

  it("activeSymptomGroupValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      nav: {
        activeGroup: ""
      },
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": null
          }
        }
      }
    });
    expect(activeSymptomGroupValue(state)).toBeUndefined();
  });

  it("activeSymptomGroupValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      nav: {
        activeGroup: "gr"
      },
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": {entities: {symptomGroups: {gr: {}}}}
          }
        }
      }
    });
    expect(activeSymptomGroupValue(state)).toEqual({} as any);
  });

  it("symptomGroupCatValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      nav: {
        activeGroup: ""
      },
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": {
              entities: {
                categories: {
                  1: {
                    symptoms: []
                  }
                }
              }
            }
          }
        }
      }
    });
    spyOn(workbenchSelectors, "symptomGroupValue").and.returnValue(() => {return {categories: []}});
    expect(symptomGroupCatValue("group")(state)).toEqual([]);
  });

  it("symptomGroupCatValue", () => {
    const state = {...defaultState};
    Object.assign(state, {
      nav: {
        activeGroup: ""
      },
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": {
              entities: {
                sections: {
                  1: {
                    categories: []
                  }
                }
              }
            }
          }
        }
      }
    });
    spyOn(workbenchSelectors, "symptomGroupValue").and.returnValue(() => {return {sections: [1]}});
    expect(symptomGroupCatValue("group")(state)).toEqual([]);
  });

  it("setMandatorySymptom", () => {
    expect(setMandatorySymptom("id", "id", "id").type).toEqual(SET_MANDATORY_SYMPTOM);
  });

  it("deleteMandatorySymptom", () => {
    expect(deleteMandatorySymptom("id", "id").type).toEqual(DELETE_MANDATORY_SYMPTOM);
  });

  it("mandatorySymptoms", () => {
    expect(mandatorySymptoms({...defaultState})).toEqual({});
  });

  it("currentIllness", () => {
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        illnesses: {
          values: {
            "A": {},
            "active": {}
          },
          active: "active"
        }
      }
    });
    expect(currentIllness(state)).toEqual({} as any);
  });

  it("activeMandatorySymptoms", () => {
    const activeGroup = "active";
    spyOn(navSelectors, "activeSymptomGroup").and.returnValue(activeGroup);
    const s = {...defaultState};
    Object.assign(s, {
      workbench: {
        mandatorySymptoms: {
          "active": {}
        }
      }
    });
    expect(activeMandatorySymptoms(s)).toEqual({});
  });

  it("hasMissingMandatorySymptoms", () => {
    const activeGroup = "active";
    spyOn(navSelectors, "activeSymptomGroup").and.returnValue(activeGroup);
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        illnesses: {
          values: {
            "A": {},
            "active": {}
          },
          active: "activeIllness"
        },
        mandatorySymptoms: {
          "active": {}
        }
      }
    });
    expect(hasMissingMandatorySymptoms(state)).toBeFalsy();
  });

  it("hasMissingMandatorySymptoms", () => {
    const activeGroup = "active";
    spyOn(navSelectors, "activeSymptomGroup").and.returnValue(activeGroup);
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        illnesses: {
          values: {
            "A": {},
            "active": {
              entities: {
                symptoms: {
                  symptom: {}
                }
              }
            }
          },
          active: "active"
        },
        mandatorySymptoms: {
          "active": {
            "symptom": "sympt1"
          }
        }
      }
    });
    expect(hasMissingMandatorySymptoms(state)).toBeTruthy();
  });

  it("isActiveSymptomGroupValid", () => {
    const activeGroup = "active";
    spyOn(navSelectors, "activeSymptomGroup").and.returnValue(activeGroup);
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        illnesses: {
          values: {
            "A": {},
            "active": {}
          },
          active: "activeIllness"
        },
        mandatorySymptoms: {
          "active": {}
        },
        errors: {
          symptoms: []
        }
      }
    });
    expect(isActiveSymptomGroupValid(state)).toBeTruthy();
  });

  it("activeSymptomGroupHasAnySymptoms ", () => {
    const state = {...defaultState};
    Object.assign(state, {
      nav: {
        activeGroup: "gr"
      },
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": null
          }
        }
      }
    });
    expect(activeSymptomGroupHasAnySymptoms(state)).toBeFalsy();
  });

  it("activeSymptomGroupHasAnySymptoms ", () => {
    const state = {...defaultState};
    Object.assign(state, {
      nav: {
        activeGroup: "gr"
      },
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": {
              entities: {
                symptomGroups: {
                  gr: {
                    categories: ["activeCat"]
                  }
                },
                categories: {
                  activeCat: {
                    symptoms: [{}]
                  }
                }
              }
            }
          }
        }
      }
    });
    expect(activeSymptomGroupHasAnySymptoms(state)).toBeTruthy();
  });

  it("activeSymptomGroupHasAnySymptoms ", () => {
    const state = {...defaultState};
    Object.assign(state, {
      nav: {
        activeGroup: "gr"
      },
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": {
              entities: {
                symptomGroups: {
                  gr: {
                    categories: ["activeCat"]
                  }
                },
                categories: {
                  activeCat: {
                    symptoms: []
                  }
                }
              }
            }
          }
        }
      }
    });
    expect(activeSymptomGroupHasAnySymptoms(state)).toBeFalsy();
  });

  it("activeSymptomGroupHasAnySymptoms ", () => {
    const state = {...defaultState};
    Object.assign(state, {
      nav: {
        activeGroup: "gr"
      },
      workbench: {
        readOnlyIllness: null,
        illnesses: {
          active: "A",
          values: {
            "A": {
              entities: {
                symptomGroups: {
                  gr: {
                    categories: null
                  }
                },
                categories: {
                  activeCat: {
                    symptoms: [{}]
                  }
                }
              }
            }
          }
        }
      }
    });
    expect(activeSymptomGroupHasAnySymptoms(state)).toBeFalsy();
  });

  it("isActiveIllnessHasSymptoms", () => {
    const activeGroup = "active";
    spyOn(navSelectors, "activeSymptomGroup").and.returnValue(activeGroup);
    const state = {...defaultState};
    Object.assign(state, {
      workbench: {
        illnesses: {
          values: {
            "A": {},
            "active": {
              entities: {
                symptoms: {
                  symptom: {}
                }
              }
            }
          },
          active: "active"
        }
      }
    });
    expect(isActiveIllnessHasSymptoms(state)).toBeTruthy();
  });

  it("readOnlyIllnessID", () => {
    const state = {...defaultState};
    const readOnlyIllness = { form: { idIcd10Code: "CODE" } } as any
    Object.assign(state, { workbench: { readOnlyIllness } });
    expect(workbenchSelectors.readOnlyIllness(state)).toBe(readOnlyIllness)
    expect(readOnlyIllnessID(state)).toBe("CODE")
  });

  it("readOnlyIllnessID", () => {
    const state = {...defaultState};
    Object.assign(state, { workbench: { readOnlyIllness: null } });
    expect(readOnlyIllnessID(state)).toBe("")
  });

});
