import {OptionNamePipe} from "./option-name.pipe";

describe("OptionNamePipe", () => {
  it("create an instance", () => {
    const pipe = new OptionNamePipe();
    expect(pipe).toBeTruthy();
  });

  it("when value not provided", () => {
    const pipe = new OptionNamePipe();
    expect(pipe.transform(null, null)).toEqual(null);
  });

  it("when value provided", () => {
    const pipe = new OptionNamePipe();
    expect(pipe.transform([{name: "test", value: 1}], 1)).toEqual("test");
    expect(pipe.transform([{name: "test", value: 1}], 2)).toEqual(2);
  });

  it("when multi select", () => {
    const pipe = new OptionNamePipe();
    expect(pipe.transform([{name: "test", value: 1}], "1,2", true)).toEqual("test");
    expect(pipe.transform([{name: "test", value: 1}], "3,2", true)).toEqual("3,2");
  });

});
