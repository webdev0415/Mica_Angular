import {DEL_MSG, DEL_UNDO, POST_MSG, POST_UNDO, UPGRADE_MESSAGES} from "./messages.actions";
import {messagesReducer} from "./messages.reducer";
import {messagesStateInit} from "../../app.config";
import NotificationMessage = MICA.NotificationMessage;

describe("messages reducer", () => {
  it("POST_MSG", () => {
    const text = "text";
    const s = {...messagesStateInit};
    Object.assign(s, {queue: [{text: text} as NotificationMessage]});
    const action = {
      type: POST_MSG,
      text: text,
      options: {}
    };
    const res = messagesReducer(s, action);
    expect(res.queue.length).toEqual(1);
  });

  it("POST_MSG", () => {
    const text = "text";
    const s = {...messagesStateInit};
    Object.assign(s, {queue: [{text: text} as NotificationMessage]});
    const action = {
      type: POST_MSG,
      text: text,
      options: null
    };
    const res = messagesReducer(s, action);
    expect(res.queue.length).toEqual(1);
  });
  it("POST_MSG", () => {
    const text = "text";
    const action = {
      type: POST_MSG,
      text: text,
      options: {}
    };
    const res = messagesReducer(messagesStateInit, action);
    expect(res.queue.length).toEqual(1);
  });

  it("DEL_MSG", () => {
    const s = {...messagesStateInit};
    const id = 17;
    Object.assign(s, {queue: [{id: id}]});
    const action = {
      type: DEL_MSG,
      id: id
    };
    expect(messagesReducer(s, action).queue.length).toEqual(0);
  });

  it("POST_UNDO", () => {
    const action = {
      type: POST_UNDO,
      message: {options: {component: "component"}}
    };
    expect(messagesReducer({...messagesStateInit}, action).actions.length).toEqual(1);
  });

  it("DEL_UNDO", () => {
    const id = 1;
    const s = {...messagesStateInit};
    Object.assign(s, {actions: [{id: id}]});
    const action = {
      type: DEL_UNDO,
      id: id
    };
    expect(messagesReducer(s, action).actions.length).toEqual(0);
  });

  it("UPGRADE_MESSAGES", () => {
    const action = {
      type: UPGRADE_MESSAGES
    };
    const s = {...messagesStateInit};
    Object.assign(s, {actions: [{}]});
    expect(messagesReducer(s, action).actions.length).toEqual(0);
  });

});
