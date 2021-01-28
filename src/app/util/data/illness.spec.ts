import {
  categoryValueFactory,
  findValidRange,
  getSelectedRanges,
  rangeExists,
  sectionValueFactory,
  symptomGroupValueFactory
} from "./illness";
import ModifierValue = Symptom.ModifierValue;

describe("Data Utils", () => {
  it("categoryValueFactory", () => {
    expect(categoryValueFactory("17")).toEqual({categoryID: "17", symptoms: []});
  });
  it("symptomGroupValueFactory not deep", () => {
    expect(symptomGroupValueFactory("17", false)).toEqual({groupID: "17", categories: []});
  });
  it("symptomGroupValueFactory deep", () => {
    expect(symptomGroupValueFactory("17", true)).toEqual({groupID: "17", sections: []});
  });
  it("sectionValueFactory", () => {
    expect(sectionValueFactory("17")).toEqual({sectionID: "17", categories: []});
  });

  it("findValidRange", () => {
    const searchRange = {
      count: 1,
      name: "1"
    };
    const validRanges = [searchRange];
    expect(findValidRange(searchRange, validRanges)).toEqual(searchRange);
  });

  it("rangeExists", () => {
    const invert = false;
    const rangeToSkip = {
      count: 1,
      name: "1"
    };
    const timeRangeA = {
      count: 2,
      name: "2"
    };
    const timeRangeB = {
      count: 3,
      name: "3"
    };
    const timeRanges = [rangeToSkip, timeRangeB, timeRangeA];
    expect(rangeExists(timeRanges, invert, rangeToSkip, timeRangeA)).toBeTruthy();
  });

  it("getSelectedTimeRanges", () => {
    const name = "Time";
    const likelihood = "likelihood";
    const timeRange = {
      count: 1,
      name: "1"
    };
    const modifierValue: ModifierValue = { name, scale: { timeFrame: timeRange.name }, likelihood };
    const validTimeRanges = { [timeRange.name]: timeRange };

    expect(getSelectedRanges([modifierValue], validTimeRanges)[likelihood][timeRange.name]).toBeTruthy();
  });

  it("getSelectedTimeRanges", () => {
    const controlName = "Time";
    const modifierValue: ModifierValue = { name: controlName, likelihood: "likelihood" };
    const validTimeRanges = {
      range: {
        count: 1,
        name: "range"
      }
    };

    expect(Object.keys(getSelectedRanges([modifierValue], validTimeRanges)).length).toEqual(0);
  });

});
