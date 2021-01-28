import {SET_ILLNESSES, setIllnesses} from "./illnesses.actions";
import {illnessesInit} from "../../app.config";
import {illnessesReducer} from "./illnesses.reducer";

describe("illness reducer", () => {
  it("SET_ILLNESSES", () => {
    const s = {...illnessesInit};
    expect(illnessesReducer(s, setIllnesses([
      {
        icd10Code: "code"
      },
      {
        icd10Code: "code"
      }
    ])).illnesses.length).toEqual(1);
  });
});
