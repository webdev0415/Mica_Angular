import {globalStateInit} from "../../app.config";
import {COUNTRY_LOAD, SET_BOOTSTRAP, UPGRADE_GLOBAL} from "./global.actions";
import {globalReducer} from "./global.reducer";

describe("globalReducer", () => {
  it("globalReducer ", () => {
    const countryName = "name";
    const state = {...globalStateInit};
    const action = {
      type: COUNTRY_LOAD,
      countries: [{name: countryName}]
    };
    expect(globalReducer(state, action).countries[0].name).toEqual(countryName);
  });

  it("SET_BOOTSTRAP", () => {
    const state = {...globalStateInit};
    const action = {
      type: SET_BOOTSTRAP,
      value: true
    };
    expect(globalReducer(state, action).bootstrapped).toEqual(true);
  });

  it("UPGRADE_GLOBAL", () => {
    const state = {...globalStateInit};
    state.bootstrapped = true;
    const action = {
      type: UPGRADE_GLOBAL
    };
    expect(globalReducer(state, action).bootstrapped).toEqual(false);
  });
});
