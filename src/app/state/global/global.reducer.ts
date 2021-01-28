import * as _ from "lodash";
import * as GlobalActions from "./global.actions";
import { Global } from "./global";
import { globalStateInit } from "../../app.config";

export const globalReducer =
  function globalReducer(state: State.Global = globalStateInit, action: Global.Actions.GlobalAction): State.Global {
    let newState: State.Global;
    switch (action.type) {
      case GlobalActions.COUNTRY_LOAD:
        const countries = (<Global.Actions.CountryLoad>action).countries;
        newState = _.assign(state, {countries: countries});
        break;
      case GlobalActions.SET_BOOTSTRAP:
        const bootstrap = (<Global.Actions.SetBootstrap>action).value;
        newState = _.assign(state, {bootstrapped: bootstrap});
        break;
      case GlobalActions.UPGRADE_GLOBAL:
        newState = globalStateInit;
        break;
      case GlobalActions.SET_CURRENT_APP:
        const appName = (<Global.Actions.SetCurrentApp>action).appName;
        newState = _.assign(state, { currentApp: appName || null });
        break;
      default:
        return state;
    }
    return _.cloneDeep(newState);
  };
