import {defaultState} from "../../app.config";
import * as ecwSelectors from "./ecw.selectors";
import {
  activeEcwIllness, activeEcwIllnessID,
  ecwValidationIllnessSg,
  ecwValidationIsSgInvalid, ecwValidationMissingData,
  ecwValidationMissingSymptomsInCat,
  ecwValidationSgCats,
  activeEcwIllnessValues, symptomGroupsFromActiveIllness, sectionsFromActiveIllness, categoriesFromActiveIllness, symptomsFromActiveIllness,
} from "./ecw.selectors";
describe("ecw selectors", () => {
  it("ecwValidationIsSgInvalid", () => {
    const state = {...defaultState};
    spyOn(ecwSelectors, "ecwValidationMissingData").and.returnValue({"17": {categoryID: "17"}});
    expect(ecwValidationIsSgInvalid("17")(state)).toBeTruthy();
  });
  it("ecwValidationMissingSymptomsInCat", () => {
    const state = {...defaultState};
    Object.assign(state, {symptoms: {entities: {symptoms: {"17": {}}}}})
    spyOn(ecwSelectors, "ecwValidationMissingData").and.returnValue({"17": {"17": {symptoms: ["17"]}}});
    const symptom = ecwValidationMissingSymptomsInCat("17", "17")(state);
    expect(symptom).toBeDefined();
  });

  it("ecwValidationIllnessSg", () => {
    const state = {...defaultState};
    const groupId = "17";
    Object.assign(state, {ecw: {validation: {illness: {symptomGroups: [{groupID: groupId}]}}}});
    expect(ecwValidationIllnessSg(groupId)(state).groupID).toEqual(groupId);
  });

  it("ecwValidationSgCats", () => {
    const state = {...defaultState};
    const groupId = "17";
    Object.assign(state, {ecw: {validation: {illness: {symptomGroups: [{groupID: groupId, categories: []}]}}}});
    expect(ecwValidationSgCats(groupId)(state).length).toEqual(0);
  });

  it("activeEcwIllness", () => {
    const state = {...defaultState};
    Object.assign(state, {ecw: {active: {}}});
    expect(activeEcwIllness(state)).toEqual({} as any);
  });

  it("ecwValidationMissingData", () => {
    const state = {...defaultState};
    Object.assign(state, {ecw: {validation: {missingData: {}}}});
    expect(ecwValidationMissingData(state)).toEqual({});
  });

  it("activeEcwIllnessID", () => {
    const state = {...defaultState};
    const code = "A";
    Object.assign(state, {ecw: {active: {icd10Code: code}}});
    expect(activeEcwIllnessID(state)).toEqual(code);
  });

  it("activeEcwIllnessValues", () => {
    const state = {...defaultState};
    const code = "A";
    Object.assign(state, {ecw: {active: {icd10Code: code}, illnesses: {values: {"A": {}}}}});
    expect(activeEcwIllnessValues(state)).toEqual({} as any);
  });

  it("symptomGroupsFromActiveIllness", () => {
    const state = {...defaultState};
    const code = "A";
    Object.assign(state, {ecw: {active: {icd10Code: code}, illnesses: {values: {"A": {entities: {symptomGroups: {}}}}}}});
    expect(symptomGroupsFromActiveIllness(state)).toEqual({} as any);
  });

  it("sectionsFromActiveIllness", () => {
    const state = {...defaultState};
    const code = "A";
    Object.assign(state, {ecw: {active: {icd10Code: code}, illnesses: {values: {"A": {entities: {sections: {}}}}}}});
    expect(sectionsFromActiveIllness(state)).toEqual({} as any);
  });

  it("categoriesFromActiveIllness", () => {
    const state = {...defaultState};
    const code = "A";
    Object.assign(state, {ecw: {active: {icd10Code: code}, illnesses: {values: {"A": {entities: {categories: {}}}}}}});
    expect(categoriesFromActiveIllness(state)).toEqual({} as any);
  });

  it("symptomsFromActiveIllness", () => {
    const state = {...defaultState};
    const code = "A";
    Object.assign(state, {ecw: {active: {icd10Code: code}, illnesses: {values: {"A": {entities: {symptoms: {}}}}}}});
    expect(symptomsFromActiveIllness(state)).toEqual({} as any);
  });

  it("validationSymptomByID", () => {
    const state = {...defaultState};
    const symptom = { rows: [ {sources: [6]}, {}, {sources: [7, 8]} ] } as Symptom.Value;
    Object.assign(state, {ecw: {validation: {
      symptoms: { "id": symptom }
    }}});
    expect(ecwSelectors.validationSymptomByID("id")(state)).toBe(symptom);
  });

});
