import {navReducer} from "./nav.reducer";
import {navInit} from "../../app.config";
import SetActiveGroup = Nav.Actions.SetActiveGroup;
import {Nav} from "./nav";
import {
  ACTIVE_SECTION_SET,
  CHANGE_NAV,
  SET_ACTIVE_CAT,
  SET_ACTIVE_GROUP,
  SET_TITLE, TOGGLE_DESCRIPTOR,
  TOGGLE_EDIT,
  TOGGLE_ILLNESS_ERRORS,
  UPGRADE_NAV
} from "./nav.actions";
import activeSectionSet = Nav.Actions.activeSectionSet;
import SetActiveCategory = Nav.Actions.SetActiveCategory;
import setTitle = Nav.Actions.setTitle;
import ToggleEdit = Nav.Actions.ToggleEdit;
import ActivateEditToken = State.ActivateEditToken;
import ChangeNavBar = Nav.Actions.ChangeNavBar;
import NavBarType = MICA.NavBarType;
import ToggleIllnessErrors = Nav.Actions.ToggleIllnessErrors;
import ToggleDescriptor = Nav.Actions.ToggleDescriptor;

describe("navReducer", () => {
  it("SET_ACTIVE_GROUP", () => {
    const action = {
      type: SET_ACTIVE_GROUP,
      group: "17"
    } as SetActiveGroup;
    const newState = navReducer(navInit, action);
    expect(newState.activeGroup).toEqual("17");
  });

  it("ACTIVE_SECTION_SET", () => {
    const action = {
      type: ACTIVE_SECTION_SET,
      section: "17"
    } as activeSectionSet;
    const newState = navReducer(navInit, action);
    expect(newState.activeSection).toEqual("17");
  });

  it("SET_ACTIVE_CAT", () => {
    const action = {
      type: SET_ACTIVE_CAT,
      id: "17"
    } as SetActiveCategory;
    const newState = navReducer(navInit, action);
    expect(newState.activeCategory).toEqual("17");
  });

  it("SET_TITLE", () => {
    const title = "TITLE";
    const action = {
      type: SET_TITLE,
      title: title
    } as setTitle;
    const newState = navReducer(navInit, action);
    expect(newState.title).toEqual(title);
  });

  it("TOGGLE_EDIT", () => {
    const edit = {
      id: "17",
      name: "name",
      index: 17,
    } as ActivateEditToken;
    const action = {
      type: TOGGLE_EDIT,
      edit: edit
    } as ToggleEdit;
    const newState = navReducer(navInit, action);
    expect(newState.activeEdit.id).toEqual("17");
    expect(newState.activeEdit.name).toEqual("name");
    expect(newState.activeEdit.index).toEqual(17);
  });

  it("TOGGLE_EDIT", () => {
    const edit = {
      id: "17",
      name: "name",
      index: 17,
    } as ActivateEditToken;
    const action = {
      type: TOGGLE_EDIT,
      edit: edit
    } as ToggleEdit;
    const state = Object.assign(navInit, {activeEdit: edit});
    const newState = navReducer(state, action);
    expect(newState.activeEdit).toBeNull();
  });

  it("UPGRADE_NAV", () => {
    const action = {
      type: UPGRADE_NAV
    };
    const initialState = {...navInit};
    initialState.title = "TITLE";
    const newState = navReducer(initialState, action);
    expect(newState.title).toEqual("MICA");
  });

  it("CHANGE_NAV", () => {
    const action = {
      type: CHANGE_NAV,
      navBar: "navbar" as NavBarType
    } as ChangeNavBar;
    const newState = navReducer(navInit, action);
    expect(newState.navBar).toEqual("navbar");
  });

  it("TOGGLE_ILLNESS_ERRORS", () => {
    const action = {
      type: TOGGLE_ILLNESS_ERRORS
    } as ToggleIllnessErrors;
    const newState = navReducer(navInit, action);
    expect(newState.showIllnessErrors).toBeTruthy();
  });

  it("TOGGLE_DESCRIPTOR", () => {
    const action = {
      type: TOGGLE_DESCRIPTOR,
      illness: "illness",
      symptom: "symptom",
      row: 17
    } as ToggleDescriptor;
    const newState = navReducer(navInit, action);
    expect(newState.activeDescriptors[action.illness]).toBeDefined();
  });

  it("TOGGLE_DESCRIPTOR", () => {
    const action = {
      type: TOGGLE_DESCRIPTOR,
      illness: "illness",
      symptom: "17",
      row: 17
    } as ToggleDescriptor;
    const initialState = navInit;
    initialState.activeDescriptors = {
      "illness": {
        "17": [1, 2, 3]
      }
    };
    const newState = navReducer(initialState, action);
    expect(newState.activeDescriptors["illness"]["17"]).toEqual([1, 2, 3, 17]);
  });

  it("TOGGLE_DESCRIPTOR", () => {
    const action = {
      type: TOGGLE_DESCRIPTOR,
      illness: "illness",
      symptom: "17",
      row: 17
    } as ToggleDescriptor;
    const initialState = navInit;
    initialState.activeDescriptors = {
      "illness": {
        "17": [1, 2, 17]
      }
    };
    const newState = navReducer(initialState, action);
    expect(newState.activeDescriptors["illness"]["17"]).toEqual([]);
  });

});
