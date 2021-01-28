import { TitleCasePipe } from "./title-case.pipe";

describe("TitleCasePipe", () => {
  it("create an instance", () => {
    const pipe = new TitleCasePipe();
    expect(pipe).toBeTruthy();
  });
  it("value not provided", () => {
    const pipe = new TitleCasePipe();
    expect(pipe.transform(null)).toEqual("");
  });
  it("value provided", () => {
    const pipe = new TitleCasePipe();
    expect(pipe.transform("-A-")).toEqual("-a-");
  });
  it("value provided", () => {
    const pipe = new TitleCasePipe();
    expect(pipe.transform("AA")).toEqual("AA");
  });
});
