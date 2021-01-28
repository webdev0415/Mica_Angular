import {getChangedPart, updateErrorState} from "./updater";

describe("updated", () => {
  it("getChangedPart", () => {
    const semantic = ["major", "minor", "patch"] as MICA.SemanticVersioning[];
    expect(getChangedPart(["2", "2", "2", "1", "1", "1"], semantic)).toEqual(semantic);
  });
  it("getChangedPart", () => {
    const semantic = ["major", "minor", "patch"] as MICA.SemanticVersioning[];
    expect(getChangedPart(["1", "2", "2", "1", "1", "1"], semantic)).toEqual(semantic.slice(1));
  });
  it("getChangedPart", () => {
    const semantic = ["major", "minor", "patch"] as MICA.SemanticVersioning[];
    expect(getChangedPart(["1", "1", "2", "1", "1", "1"], semantic)).toEqual(semantic.slice(2));
  });

  it("updateErrorState", () => {
    const state = { errors: { symptoms: {} } as Task.ActiveIllnessError } ;
    const error = {
      groupID: "general",
      bodyParts: null,
      rowErrors: [{index: 1}],
      symptomID: "SYMPT1"
    } as Symptom.ValueError;
    const newState = updateErrorState(error, state.errors);
    expect(newState.symptoms["general"].length).toBe(1);
  })

  it("updateErrorState should to remove symptoms", () => {
    const state = { errors: { symptoms: {
      general: [
        {groupID: "general", bodyParts: null, rowErrors: [{index: 1}], symptomID: "SYMPT1"}
        ]
    }}} ;
    const error = {
      groupID: "general",
      bodyParts: null,
      rowErrors: [],
      symptomID: "SYMPT1"
    } ;

    const newState = updateErrorState(error as any, state.errors as any);
    expect(newState.symptoms["general"]).toBeUndefined();
  })

});
