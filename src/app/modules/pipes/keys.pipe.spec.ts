import {KeysPipe} from "./keys.pipe";

describe("Keys Pipe", () => {
  it("when value not provided", () => {
    const pipe = new KeysPipe();
    expect(pipe.transform(null)).toEqual([]);
  });
  it("when value provided", () => {
    const pipe = new KeysPipe();
    expect(pipe.transform({login: "login", password: "password"})).toEqual(["login", "password"]);
  });
});
