import { ActionCreator } from "redux";
import { Nav } from "./nav";

export const ACTIVE_SECTION_SET = "[Nav] Active Section Set";
export const SET_ACTIVE_GROUP = "[Nav] Set Active Group";
export const SET_ACTIVE_CAT = "[Nav] Set Active Category";
export const SET_TITLE = "[Nav] Set Page Title";
export const TOGGLE_DESCRIPTOR = "[Nav] Toggle Descriptor";
export const TOGGLE_EDIT = "[Nav] Toggle Edit";
export const UPGRADE_NAV = "[Nav] Upgrade";
export const CHANGE_NAV = "[Nav] Change NavBar";
export const TOGGLE_ILLNESS_ERRORS = "[Nav] Toggle Illness Errors";

export const setActiveGroup: ActionCreator<Nav.Actions.SetActiveGroup> =
  (group: string) => ({
    type: SET_ACTIVE_GROUP,
    group: group
  });

export const activeSectionSet: ActionCreator<Nav.Actions.activeSectionSet> =
  (section: string) => ({
    type: ACTIVE_SECTION_SET,
    section: section
  });

export const setActiveCategory: ActionCreator<Nav.Actions.SetActiveCategory> =
  (id: string) => ({
    type: SET_ACTIVE_CAT,
    id
  });

export const titleSet: ActionCreator<Nav.Actions.setTitle> =
  (title: string) => ({
    type: SET_TITLE,
    title: title
  });

// export const selectBodyPart: ActionCreator<Nav.Actions.SelectBodyPart> =
//   (zone: string, bodyParts: string[], selected?: string[]) => ({
//     type: SELECT_BODY_PART,
//     zone: zone,
//     bodyParts: bodyParts,
//     selected: selected
//   });

export const toggleDescriptor: ActionCreator<Nav.Actions.ToggleDescriptor> =
  (illness: string, symptom: string, row: number) => ({
    type: TOGGLE_DESCRIPTOR,
    illness: illness,
    symptom: symptom,
    row: row
  });

export const changeNavBar: ActionCreator<Nav.Actions.ChangeNavBar> =
  (navBar: MICA.NavBarType) => ({
    type: CHANGE_NAV,
    navBar
  });

