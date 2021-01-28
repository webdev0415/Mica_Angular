import {defaultState} from "../../app.config";
import {appVersion} from "./global.selectors";

describe("global selectors", () => {
  it("appVersion", () => {
    const state = {...defaultState};
    const version = "4.0.5";
    Object.assign(state, {global: {version: version}});
    expect(appVersion(state)).toEqual(version);
  });
});
