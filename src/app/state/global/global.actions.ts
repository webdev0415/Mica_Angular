import { ActionCreator } from "redux";
import { Global } from "./global";

export const SET_CURRENT_APP = "[Nav] Set Current App";
export const COUNTRY_LOAD = "[Global] Load countries";
export const SET_BOOTSTRAP = "[Global] Set bootstrap";
export const UPGRADE_GLOBAL = "[Global] Upgrade";


export const setCurrentApp: ActionCreator<Global.Actions.SetCurrentApp> =
  (appName?: State.AppName) => ({
    type: SET_CURRENT_APP,
    appName
  });
