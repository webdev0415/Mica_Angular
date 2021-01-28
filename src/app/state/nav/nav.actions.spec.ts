import {
  ACTIVE_SECTION_SET,
  activeSectionSet, CHANGE_NAV, changeNavBar, SET_ACTIVE_CAT,
  SET_ACTIVE_GROUP,
  SET_TITLE, setActiveCategory,
  setActiveGroup,
  titleSet,
  TOGGLE_DESCRIPTOR,
  toggleDescriptor
} from "./nav.actions";

describe("nav actions", () => {

  it("setActiveGroup", () => {
    const group = "group";
    const result = setActiveGroup(group);
    expect(result.group).toEqual(group);
    expect(result.type).toEqual(SET_ACTIVE_GROUP);
  });

  it("titleSet", () => {
     const title = "title";
     const result = titleSet(title);
     expect(result.title).toEqual(title);
     expect(result.type).toEqual(SET_TITLE);
  });

  it("toggleDescriptor", () => {
    const illness = "ill";
    const symptom = "symptom";
    const row = 1;
    const result = toggleDescriptor(illness, symptom, row);
    expect(result.illness).toEqual(illness);
    expect(result.symptom).toEqual(symptom);
    expect(result.row).toEqual(row);
    expect(result.type).toEqual(TOGGLE_DESCRIPTOR);
  });

  it("activeSectionSet", () => {
      const section = "section";
      const result = activeSectionSet(section);
      expect(result.section).toEqual(section);
      expect(result.type).toEqual(ACTIVE_SECTION_SET);
  });

  it("setActiveCategory", () => {
     const id = "id";
     const result = setActiveCategory(id);
     expect(result.id).toEqual(id);
     expect(result.type).toEqual(SET_ACTIVE_CAT);
  });

  it("changeNavBar", () => {
     const navBar = "navBar";
     const result = changeNavBar(navBar);
     expect(result.navBar).toEqual(navBar);
     expect(result.type).toEqual(CHANGE_NAV);
  });

});
