import {defaultState} from "../../app.config";
import {allIllnesses, findIllnesses, illnessByIcd10Code} from "./illnesses.selectors";
import DataShort = Illness.DataShort;

describe("illnesses selectors", () => {
  it("allIllnesses", () => {
    const s = {...defaultState};
    Object.assign(s, {
      illnesses: {
        illnesses: [
          {
            icd10Code: "A00"
          } as DataShort
        ]
      }
    });
    expect(allIllnesses(s).length).toEqual(1);
  });

  it("findIllnesses", () => {
    const s = {...defaultState};
    Object.assign(s, {
      illnesses: {
        illnesses: [
          {
            icd10Code: "A00"
          } as DataShort
        ]
      }
    });
    expect(findIllnesses("A")(s).length).toEqual(1);
  });

  it("illnessByIcd10Code ", () => {
    const s = {...defaultState};
    Object.assign(s, {
      illnesses: {
        illnesses: [
          {
            icd10Code: "A00",
          } as DataShort
        ]
      }
    });
    expect(illnessByIcd10Code("A00")(s)["icd10Code"]).toEqual("A00");
  });

  it("illnessByIcd10Code ", () => {
    const s = {...defaultState};
    Object.assign(s, {
      illnesses: {
        illnesses: [
          {
            icd10Code: "A00"
          } as DataShort
        ]
      }
    });
    expect(illnessByIcd10Code("A01")(s).name).toEqual("");
  });
});
