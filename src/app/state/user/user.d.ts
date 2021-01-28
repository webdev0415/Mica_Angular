import { Action } from "redux";

declare namespace User {

  /**
   *   ACTIONS
   */

  namespace Actions {
    export interface Set extends Action {
      user: MICA.User.Data;
    }

    export interface Upgrade extends Action {}

    // export interface allSet extends Action {
    //   users: MICA.User.Data[];
    // }

    export type UserAction = Set | Upgrade;
  }
}

declare module "User" {
  export = User;
}
