import { groupsInit } from "../../app.config";
import { GroupsActions } from "./groups";
import { SET_GROUPS, ADD_GROUPS, DELETE_GROUP } from "./groups.actions";
import * as _ from "lodash";


export function groupsReducer(state: State.GroupsState = groupsInit,
                              action: GroupsActions.GroupsAction): State.GroupsState {

  switch (action.type) {
    case SET_GROUPS:
      return { ...state, groups: (<GroupsActions.SetGroups>action).payload };

    case ADD_GROUPS:
      return { ...state, groups: state.groups.concat((<GroupsActions.AddGroup>action).payload) };

    case DELETE_GROUP:
      return { ...state, groups: _.remove(state.groups, item => item.groupID !== action.payload) };

    default:
      return state;
  }
}
