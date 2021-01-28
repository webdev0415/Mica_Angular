import { Action } from "redux";

declare namespace Global {

  /**
   *   ACTIONS
   */
  namespace Actions {

    interface CountryLoad extends Action {
      countries: MICA.Country[];
    }

    interface SetBootstrap extends Action {
      value: boolean;
    }

    interface Upgrade extends Action {
    }

    interface SetCurrentApp extends Action {
      appName?: State.AppName
    }

    type GlobalAction = CountryLoad | SetBootstrap | Upgrade | SetCurrentApp;
  }
}

declare module "Global" {
  export = Global;
}
