import {PascalCasePipe} from "./pascal-case.pipe";
import {CamelCasePipe} from "./camel-case.pipe";

describe("Pascal Case Pipe", () => {
  it("when value not provided", () => {
    const pipe = new PascalCasePipe(new CamelCasePipe());
    expect(pipe.transform(null, 0)).toEqual("");
  });
  it("when value provided", () => {
    const pipe = new PascalCasePipe(new CamelCasePipe());
    expect(pipe.transform("abc D", 0)).toEqual("AbcD");
  });
});
