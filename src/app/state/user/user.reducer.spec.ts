import {SET_USER} from "../actionTypes";
import {userReducer} from "./user.reducer";
import {userInit} from "../../app.config";

describe("user reducer", () => {
  it("SET_USER", () => {
    const email = "email";
    const user = {
      email: email
    };
    const action = {
      type: SET_USER,
      user: user
    };
    expect(userReducer(userInit, action).email).toEqual(email);
  });
  it("SET_USER", () => {
    const email = "email";
    const user = {
      email: email
    };
    const action = {
      type: SET_USER,
      user: null
    };
    expect(userReducer(userInit, action).email).toEqual("");
  });
});
