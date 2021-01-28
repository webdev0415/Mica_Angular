import * as _ from "lodash";
import * as MessagesActions from "./messages.actions";
import { Messages } from "./messages.d";
import { messagesStateInit } from "../../app.config";

export const messagesReducer =
  function messagesReducer(state: State.Messages = messagesStateInit, action: Messages.Actions.MessagesAction): State.Messages {
    let newState: State.Messages;
    switch (action.type) {
      case MessagesActions.POST_MSG:
        const message: MICA.NotificationMessage = {
          text: (<Messages.Actions.PostMsg>action).text,
          id: _.random(0, 1000000),
          options: (<Messages.Actions.PostMsg>action).options || {}
        };
        if (_.find(state.queue, {"text": message.text})) {
          newState = state;
          break;
        }
        const queuePost = _.concat(state.queue, [message]);
        newState = _.assign(state, {queue: queuePost});
        break;
      case MessagesActions.DEL_MSG:
        const delId = (<Messages.Actions.DelMsg>action).id;
        const queuePurged = _.clone(state.queue);
        const objIndex = queuePurged.map(e => e.id).indexOf(delId);
        if (objIndex >= 0) queuePurged.splice(objIndex, 1);
        newState = _.assign(state, {queue: queuePurged})
        break;
      case MessagesActions.POST_UNDO:
        const m = (<Messages.Actions.PostUndoAction>action).message;
        const newAction: MICA.NotificationAction = {
          id: _.random(0, 1000000),
          component: m.options["component"],
          action: "UNDO",
          message: m
        };
        const actionsPost = _.concat(state.actions, [newAction]);
        newState = _.assign(state, {actions: actionsPost});
        break;
      case MessagesActions.DEL_UNDO:
        const actionId = (<Messages.Actions.DelUndoAction>action).id;
        const actionsPurged = _.clone(state.actions);
        actionsPurged.splice(_.findIndex(actionsPurged, {actionId} as any), 1);
        newState = _.assign(state, {actions: actionsPurged});
        break;
      case MessagesActions.UPGRADE_MESSAGES:
        newState = messagesStateInit;
        break;
      default:
        return state;
    };
    return _.cloneDeep(newState);
  };
