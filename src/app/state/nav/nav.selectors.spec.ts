import {defaultState} from "../../app.config";
import {
  activeCategoryID,
  activeCategoryIDNext,
  activeSectionID,
  activeSymptomGroup,
  getCategory,
  symptomItemPath,
  symptomItemsIDs
} from "./nav.selectors";
import * as navSelectors from "./nav.selectors";

describe("nav selectors", () => {
  it("activeSymptomGroup", () => {
    const state = {...defaultState};
    Object.assign(state, {nav: {activeGroup: null}});
    expect(activeSymptomGroup(state)).toEqual("");
  });

  it("getCategory", () => {
    const sg = {categories: ["1", "2"]};
    const catId = "1";
    const section = null;
    expect(getCategory(catId, sg, section)).toEqual("2");
  });

  it("activeSectionID", () => {
      const s = {...defaultState};
      const activeSection = "section";
      Object.assign(s, {
        nav: {
          activeSection: activeSection
        }
      });
      expect(activeSectionID(s)).toEqual(activeSection);
  });

  it("getCategory", () => {
    const sg = {categories: ["1", "2"]};
    const catId = "3";
    const section = null;
    expect(getCategory(catId, sg, section)).toEqual("1");
  });

  it("getCategory", () => {
    const sg = {categories: null};
    const catId = "1";
    const section = {categories: ["1", "2"]};
    expect(getCategory(catId, sg, section)).toEqual("2");
  });

  it("getCategory", () => {
    const sg = {categories: null};
    const catId = "3";
    const section = {categories: ["1", "2"]};
    expect(getCategory(catId, sg, section)).toEqual("1");
  });

  it("getCategory", () => {
    expect(getCategory(null, {categories: null}, null)).toBeUndefined();
  });

  it("symptomItemPath", () => {
    const s = {...defaultState};
    const symptomName = "AB";
    const path = "path";
    Object.assign(s, {nav: {symptomItems: [{name: symptomName, path: path}]}});
    expect(symptomItemPath(symptomName)(s)).toEqual(path);
  });

  it("symptomItemPath", () => {
    const s = {...defaultState};
    const symptomName = "AB";
    const path = "path";
    Object.assign(s, {nav: {symptomItems: [{name: "BC", path: path}]}});
    expect(symptomItemPath(symptomName)(s)).toBeNull();
  });

  it("symptomItemsIDs", () => {
    const s = {...defaultState};
    const symptomName = "name";
    Object.assign(s, {nav: {
      symptomItems: [
        {
          name: `${symptomName}/`
        }
      ]
      }});
    expect(symptomItemsIDs(s)).toEqual([symptomName]);
  });

  it("activeCategoryID ", () => {
    const s = {...defaultState};
    const activeCategory = "cat";
    Object.assign(s, {
      nav: {
        activeCategory: activeCategory
      }
    });
    expect(activeCategoryID(s)).toEqual(activeCategory);
  });

  it("activeCategoryIDNext", () => {
      const getCategorySpy = spyOn(navSelectors, "getCategory").and.callFake(() => { return null; });
      activeCategoryIDNext({...defaultState});
      expect(getCategorySpy).toHaveBeenCalled();
  });

});
