import { defaultState } from "../../app.config";
import { findGroupsLive } from "./groups.selectors";

describe("groups selectors", () => {
  it("findGroupsLive without value", () => {
    const state = {...defaultState};
    expect(findGroupsLive("")(state)).toEqual([]);
  });

  it("findGroupsLive without value", () => {
    const state = {...defaultState};
    const groupNewData: Groups.Group = {name: "one", groupID: 1};
    state.groups = {...state.groups, groups: state.groups.groups.concat([groupNewData])}
    expect(findGroupsLive("one")(state)).toEqual([groupNewData]);
  });
});
