import { defaultState } from "app/app.config";
import {
  activeSectionCatsData, activeSymptomsIDs, cachedNlpSymptomsArr, catNameFromID, findSymptomEnhanced,
  findSymptomLive, multiplierValues, nlpSymptomData, nlpSymptomsPage,
  sectionIDFromName,
  sectionNameFromID, symptomDataMany, symptomDataPath,
  symptomGroupDataLoaded,
  symptomNameFromID, symptomsInCatData, symptomsInCatIDs, typeaheadItems, validTimeRanges
} from "./symptoms.selectors";
import * as symptomsSelectors from "./symptoms.selectors";
import * as navSelectors from "../nav/nav.selectors";
import Data = Symptom.Data;

describe("symptoms selectors", () => {
  it("activeSectionCatsData", () => {
    const state = {...defaultState};
    Object.assign(state, {nav: {activeSection: "17"}});
    Object.assign(state, {symptoms: {entities: {sections: {"17": {name: "17", categories: []}}}}});
    expect(activeSectionCatsData(state)).toBeDefined();
  });
  it("activeSectionCatsData  ", () => {
    const state = {...defaultState};
    Object.assign(state, {nav: {activeSection: "18"}});
    Object.assign(state, {symptoms: {entities: {sections: {"17": {name: "17", categories: []}}}}});
    expect(activeSectionCatsData(state).length).toEqual(0);
  });
  it("sectionNameFromID", () => {
    const state = {...defaultState};
    Object.assign(state, {nav: {activeSection: "17"}});
    Object.assign(state, {symptoms: {entities: {sections: {"17": {name: "17", categories: []}}}}});
    expect(sectionNameFromID("17")(state)).toEqual("17");
  });
  it("sectionNameFromID", () => {
    const state = {...defaultState};
    Object.assign(state, {nav: {activeSection: "18"}});
    Object.assign(state, {symptoms: {entities: {sections: {"17": {name: "17", categories: []}}}}});
    expect(sectionNameFromID("18")(state)).toEqual("");
  });

  it("symptomNameFromID", () => {
    const state = {...defaultState};
    Object.assign(state, {symptoms: {entities: {symptoms: {"17": {name: "17"}}}}});
    const consoleErrorSpy = spyOn(console, "error").and.callThrough();
    expect(symptomNameFromID("18")(state)).toEqual("");
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("findSymptomLive", () => {
    const state = {...defaultState};
    expect(findSymptomLive("")(state)).toEqual([]);
  });
  it("sectionIDFromName", () => {
    const state = {...defaultState};
    Object.assign(state, {symptoms: {entities: {sections: {"17": {name: "17", sectionID: "17"}}}}});
    expect(sectionIDFromName("17")(state)).toEqual("17");
  });
  it("sectionIDFromName", () => {
    const state = {...defaultState};
    Object.assign(state, {symptoms: {entities: {sections: {"17": {name: "17", sectionID: "17"}}}}});
    expect(sectionIDFromName("18")(state)).toEqual("");
  });

  it("symptomGroupDataLoaded", () => {
    spyOn(symptomsSelectors, "entities").and.returnValue({
        symptomGroups: {
          "id": {}
        }
      });
    spyOn(navSelectors, "symptomItemsIDs").and.returnValue(["id"]);
    const s = {...defaultState};
    Object.assign(s, {
      symptoms: {
        entities: {
          symptomGroups: {
            "id": {}
          }
        }
      }
    });
    expect(symptomGroupDataLoaded(s)).toBeTruthy();
  });

  it("multiplierValues", () => {
    expect(multiplierValues(null)({...defaultState})).toBeUndefined();
  });

  it("multiplierValues", () => {
    const s = {...defaultState};
    Object.assign(s, {
      symptoms: {
        entities: {
          symptomGroups: {
            "id": {}
          }
        }
      }
    });
    const template = {} as Data;
    expect(multiplierValues(template)(s)).toBeUndefined();
  });

  it("typeaheadItems", () => {
    const name = "name";
    const s = {...defaultState};
    Object.assign(s, {
      symptoms: {
        multiplier: {
          typeahead: {
            name: [
              {
                name: name
              }
            ]
          }
        }
      }
    });
    expect(typeaheadItems(name)(s)[0].name).toEqual(name);
  });

  it("symptomDataPath", () => {
    const s = {...defaultState};
    const symptomId = "id";
    const categoryId = "catId";
    const sectionId = "secId";
    const groupId = "groupId";
    Object.assign(s, {
      symptoms: {
        nlpSymptoms: {
          cachedSymptoms: {}
        },
        entities: {
          categories: {
            "cat": {
              symptoms: [symptomId],
              categoryID: categoryId
            }
          },
          sections: {
            "section": {
              sectionID: sectionId,
              categories: [categoryId]
            }
          },
          symptomGroups: {
            "group": {
              categories: [categoryId],
              sections: [sectionId],
              groupId: null
            }
          },
          symptoms: {
            "id": {
              subGroups: [
                "", "", ""
              ]
            }
          }
        }
      }
    });
    expect(symptomDataPath(symptomId)(s).viewName).toBeNull();
    expect(symptomDataPath(symptomId, null, true)(s).categoryID).toEqual("SYMPTCG33");
  });

  xit("symptomsInCatData", () => {
    const s = {...defaultState};
    Object.assign(s, {
      symptoms: {
        entities: {
          categories: {
            "catId": {
              name: "name",
              categoryId: "id",
              symptoms: []
            }
          }
        }
      }
    });
    expect(symptomsInCatData("catId")(s)).toEqual([]);
  });

  it("symptomsInCatIDs", () => {
    const s = {...defaultState};
    Object.assign(s, {
      nav: {
        activeCategory: "cat"
      },
      symptoms: {
        entities: {
          categories: {
            "cat": {
              symptoms: []
            }
          }
        }
      }
    });
    expect(symptomsInCatIDs("cat")(s)).toEqual([]);
    expect(activeSymptomsIDs(s)).toEqual([]);
  });

  it("symptomsInCatIDs", () => {
    const s = {...defaultState};
    Object.assign(s, {
      nav: {
        activeCategory: "cat"
      },
      symptoms: {
        entities: {
          categories: {
            "category": {
              symptoms: []
            }
          }
        }
      }
    });
    expect(activeSymptomsIDs(s)).toEqual([]);
  });

  it("symptomDataMany", () => {
    const s = <any>{
      ...defaultState,
      symptoms: {
        entities: {
          symptoms: {
            id: {}
          },
        },
      }
    };
    const symptomIds = ["id"];

    expect(symptomDataMany(symptomIds)(s).length).toEqual(1)
  });

  it("catNameFromID", () => {
    const s = {...defaultState};
    Object.assign(s, {
      symptoms: {
        entities: {
          categories: {
            "cat": {
              name: "name"
            }
          }
        }
      }
    });
    expect(catNameFromID("cat")(s)).toEqual("name");
  });

  it("findSymptomEnhanced ", () => {
    const s  = {...defaultState};
    Object.assign(s, {
      symptoms: {
        entities: {
          symptoms: {
            "symptom": {
              multipleValues: "value",
              symptomID: "id",
              name: "name"
            }
          },
          symptomGroups: {
            "group": {
              dataStoreRefTypes: {
                "value": {
                  values: [
                    {
                      name: "value",
                      value: "value"
                    }
                  ]
                }
              }
            }
          }
        }
      }
    });
    expect(findSymptomEnhanced("VALUE")(s)).toBeDefined();
  });

  it("findSymptomEnhanced ", () => {
    const s  = {...defaultState};
    Object.assign(s, {
      symptoms: {
        entities: {
          symptoms: {
            "symptom": {
              multipleValues: null,
              symptomID: "id",
              name: "name"
            }
          },
          symptomGroups: {
            "group": {
              dataStoreRefTypes: {
                "value": {
                  values: [
                    {
                      name: "value",
                      value: "value"
                    }
                  ]
                }
              }
            }
          }
        }
      }
    });
    expect(findSymptomEnhanced("VALUE")(s)).toBeDefined();
  });

  it("findSymptomEnhanced ", () => {
    const s  = {...defaultState};
    Object.assign(s, {
      symptoms: {
        entities: {
          symptoms: {
            "symptom": {
              multipleValues: "value",
              symptomID: "id",
              name: "name"
            }
          },
          symptomGroups: {
            "group": {
              dataStoreRefTypes: {
                "value": {
                  values: [
                    {
                      name: "value",
                      value: "value"
                    }
                  ]
                }
              }
            }
          }
        }
      }
    });
    expect(findSymptomEnhanced("")(s)).toBeDefined();
  });

  it("validTimeRanges ", () => {
    const timeBucketValues = [
      {
        count: 2,
        name: "two"
      },
      {
        count: 1,
        name: "one"
      }
    ];
    const s  = {
      ...defaultState,
      symptoms: {
        entities: {
          symptoms: {
            symptom: {
              multipleValues: "value",
              symptomID: "id",
              name: "name"
            }
          },
          symptomGroups: {
            group: {
              dataStoreRefTypes: {
                Timebucket: {
                  values: timeBucketValues
                }
              }
            }
          }
        }
      }
    };
    const timeRanges = validTimeRanges(<any>s);

    expect(Object.keys(timeRanges).length).toEqual(Object.keys(timeBucketValues).length);
  });

  it("validTimeRanges are null", () => {
    const s  = {...defaultState};
    Object.assign(s, {
      symptoms: {
        entities: {
          symptoms: {
            symptom: {
              multipleValues: "value",
              symptomID: "id",
              name: "name"
            }
          },
          symptomGroups: {
            group: {
              dataStoreRefTypes: {
                Timebucket: {
                  values: null
                }
              }
            }
          }
        }
      }
    });
    const timeRanges = validTimeRanges(s);

    expect(Object.keys(timeRanges).length).toEqual(0);
  });

  it("totalNlpSymptoms", () => {
    const state = {...defaultState};
    Object.assign(state, {
      symptoms: {
        nlpSymptoms: {
          total: 17
        }
      }
    });
    expect(symptomsSelectors.totalNlpSymptoms(state)).toEqual(17);
  });

  it("currentSearch", () => {
    const state = {...defaultState};
    const arr = [{}];
    Object.assign(state, {
      symptoms: {
        nlpSymptoms: {
          currentSearch: arr,
        }
      }
    });
    expect(symptomsSelectors.currentNlpSymptoms(state)).toBe(arr);
  });

  it("cachedNlpSymptomsArr", () => {
    const state = {...defaultState};
    Object.assign(state, {
      symptoms: {
        nlpSymptoms: {
          cachedSymptoms: {id: {}},
          page: 1
        }
      }
    });
    expect(cachedNlpSymptomsArr(state).length).toEqual(1);
  });

  it("nlpSymptomsPage", () => {
    const state = {...defaultState};
    Object.assign(state, {
      symptoms: {
        nlpSymptoms: {
          page: 17
        }
      }
    });
    expect(nlpSymptomsPage(state)).toEqual(17);
  });

  it("nlpSymptomData", () => {
    const code = "code";
    const state = {...defaultState};
    Object.assign(state, {
      symptoms: {
        nlpSymptoms: {
          cachedSymptoms: {[code]: {}},
          page: 1
        }
      }
    });
    expect(nlpSymptomData(code)(state)).toBeDefined();
  });

});
