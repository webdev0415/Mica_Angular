// import * as NavActions from "./nav.actions";
import { Nav } from "./nav";
import * as NavActions from "./nav.actions";
import * as _ from "lodash";
import { navInit } from "../../app.config";

export const navReducer = (state: State.Nav = navInit, action: Nav.Actions.NavAction): State.Nav => {
    switch (action.type) {
      case NavActions.SET_ACTIVE_GROUP:
        const activeGroup = (<Nav.Actions.SetActiveGroup>action).group;
        return {...state, activeGroup };
      case NavActions.ACTIVE_SECTION_SET:
        const activeSection = (<Nav.Actions.activeSectionSet>action).section;
        return {...state, activeSection };
      case NavActions.SET_ACTIVE_CAT:
        const activeCategory = (<Nav.Actions.SetActiveCategory>action).id;
        return {...state, activeCategory };
      case NavActions.SET_TITLE:
        const title = (<Nav.Actions.setTitle>action).title;
        return {...state, title };
      case NavActions.TOGGLE_DESCRIPTOR:
        const symptom = (<Nav.Actions.ToggleDescriptor>action).symptom;
        const row = (<Nav.Actions.ToggleDescriptor>action).row;
        const illness = (<Nav.Actions.ToggleDescriptor>action).illness;
        const activeDescriptors = _.cloneDeep(state.activeDescriptors);
        if (!activeDescriptors[illness]) activeDescriptors[illness] = {};
        const current = activeDescriptors[illness];
        const symptomDescriptors = current[symptom];
        if (symptomDescriptors) {
          const rowIndex = ~_.indexOf(symptomDescriptors, row);
          if (rowIndex) {
            symptomDescriptors.splice(rowIndex);
          } else {
            symptomDescriptors.push(row);
          }
        } else {
          current[symptom] = [row];
        }
        return {...state, activeDescriptors };
      case NavActions.TOGGLE_EDIT:
        const token = (<Nav.Actions.ToggleEdit>action).edit;
        return {...state, activeEdit: _.isEqual(token, state.activeEdit) ? null : token};
      case NavActions.UPGRADE_NAV:
        return navInit;
      case NavActions.CHANGE_NAV:
        const navBar = (<Nav.Actions.ChangeNavBar>action).navBar;
        return {...state, navBar };
      case NavActions.TOGGLE_ILLNESS_ERRORS:
        return {...state, showIllnessErrors: !state.showIllnessErrors};
      default:
        return state;
    }
  };
