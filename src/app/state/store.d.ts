import { Action } from "redux";

declare namespace Store {

  /**
   *   ACTIONS
   */
  namespace Actions {

    interface ShareState extends Action {
      stateRoot: State.Root
    }

    type StoreAction = ShareState;
  }
}

declare module "Store" {
  export = Store;
}
