import {allGroupsComplete} from "./all-groups";
import {FormControl} from "@angular/forms";

describe("all groups validator", () => {
  it("validates complete groups", () => {
    const groups = ["a", "b", "c"];
    const formControl = new FormControl(["a", "b", "c", "d"]);
    expect(allGroupsComplete(groups)(formControl)).toEqual(null);
  });
  it("validates incomplete groups", () => {
    const groups = ["a", "b", "g"];
    const formControl = new FormControl(["a", "b", "c", "d"]);
    expect(allGroupsComplete(groups)(formControl)).toEqual({groupsComplete: {incomplete: true}});
  });
  it("validates invalid data", () => {
    const groups = ["a", "b", "g"];
    const formControl = new FormControl("17");
    const complete = () => allGroupsComplete(groups)(formControl);
    expect(complete).toThrow(new Error("All groups validator can only be used in string[]"));
  });
});
