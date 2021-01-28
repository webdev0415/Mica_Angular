import { setGroups, addGroup, deleteGroup } from "./groups.actions";
import { groupsInit } from "../../app.config";
import { groupsReducer } from "./groups.reducer";
import * as _ from "lodash";

describe("group reducer", () => {
  const groups = [
    {
      name: "one",
      groupID: 1,
    },
    {
      name: "two",
      groupID: 2,
    },
  ];
  const state = { ...groupsInit };

  it("SET_GROUPS", () => {
    const action = setGroups(groups);

    expect(groupsReducer(state, action).groups.length).toEqual(groups.length);
  });

  it("ADD_GROUP", () => {
    const newGroupData = { name: "three", groupID: 3 };
    const action = addGroup(newGroupData);

    expect(groupsReducer(state, action).groups.length).toEqual(1);
  });

  it("DELETE_GROUP", () => {
    const groupState = _.cloneDeep(groupsInit);
    const action = deleteGroup(groups[0].groupID);

    groupState.groups = groups;
    expect(groupsReducer(groupState, action).groups.length).toEqual(1);
  })

});
