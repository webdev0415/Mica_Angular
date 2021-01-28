import { Action } from "redux";

declare namespace GroupsActions {

  interface SetGroups extends Action {
    payload: Groups.Group[];
  }

  interface AddGroup extends Action {
    payload: Groups.Group;
  }

  interface DeleteGroup extends Action {
    payload: number;
  }

  type GroupsAction = SetGroups | AddGroup | DeleteGroup;

}
