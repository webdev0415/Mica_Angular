import { User } from "./user";
import * as UserActions from "./user.actions";
import * as _ from "lodash";
import { userInit } from "../../app.config";

export const userReducer = (state: State.UserState = userInit, action: User.Actions.UserAction): State.UserState => {
    let newState: State.UserState;

    switch (action.type) {
      case UserActions.SET_USER:
        const activeUser = (<User.Actions.Set>action).user;

        newState = activeUser && activeUser.email ? activeUser : userInit;
        break;
      default:
        return state;
    }

    return _.cloneDeep(newState);
  };
