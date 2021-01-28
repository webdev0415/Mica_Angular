import { CamelCasePipe } from "./camel-case.pipe";

describe("CamelCasePipe", () => {
  it("create an instance", () => {
    const pipe = new CamelCasePipe();
    expect(pipe).toBeTruthy();
  });
  it("when value not provided", () => {
    const pipe = new CamelCasePipe();
    expect(pipe.transform(null)).toEqual("");
  });
  it("when value provided", () => {
    const pipe = new CamelCasePipe();
    expect(pipe.transform("Abc D")).toEqual("abcD");
  });
});
