import { Action } from "redux";

declare namespace Messages {

  /**
   *   ACTIONS
   */
  namespace Actions {
    interface PostMsg extends Action {
      text: string;
      options?: {[name: string]: string}
    }

    interface DelMsg extends Action {
      id: number;
    }

    interface PostUndoAction extends Action {
      message: MICA.NotificationMessage;
    }

    interface DelUndoAction extends Action {
      id: number;
    }

    interface Upgrade extends Action {}

    type MessagesAction = PostMsg | DelMsg | PostUndoAction | DelUndoAction | Upgrade;
  }
}

declare module "Messages" {
  export = Messages;
}
