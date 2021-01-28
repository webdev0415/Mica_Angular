import { ActionCreator } from "redux";
import { Messages } from "./messages";

export const POST_MSG = "[Messages] Post Message";
export const DEL_MSG = "[Messages] Del Message";
export const POST_UNDO = "[Messages] Post Undo";
export const DEL_UNDO = "[Messages] Del Undo";
export const UPGRADE_MESSAGES = "[Messages] Upgrade";

export const postMsg: ActionCreator<Messages.Actions.PostMsg> =
  (text: string, options: {[name: string]: any}) => ({
    type: POST_MSG,
    text: text,
    options: options
  });
