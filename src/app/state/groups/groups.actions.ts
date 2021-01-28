import { ActionCreator } from "redux";
import { GroupsActions } from "./groups.d";

export const SET_GROUPS = "[groups] Set groups";
export const ADD_GROUPS = "[groups] Add groups";
export const DELETE_GROUP = "[groups] delete group";

export const setGroups: ActionCreator<GroupsActions.SetGroups> =
  (groups: Groups.Group[]) => ({
    type: SET_GROUPS,
    payload: groups
  });

export const addGroup: ActionCreator<GroupsActions.AddGroup> =
(group: Groups.Group) => ({
  type: ADD_GROUPS,
  payload: group
});

export const deleteGroup: ActionCreator<GroupsActions.DeleteGroup> =
(groupID: number) => ({
  type: DELETE_GROUP,
  payload: groupID
});
