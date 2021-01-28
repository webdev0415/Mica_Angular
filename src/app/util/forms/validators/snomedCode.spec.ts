import {snomedCode} from "./snomedCode";
import {FormControl} from "@angular/forms";

describe("snomedCode", () => {
  it("validates empty code", () => {
    const formControl = new FormControl("");
    expect(snomedCode(formControl)).toEqual(null);
  });
  it("validates non-empty code", () => {
    const formControl = new FormControl("123");
    expect(snomedCode(formControl)).toEqual(null);
  });
  it("validates invalid code", () => {
    const formControl = new FormControl("abc");
    expect(snomedCode(formControl)).toEqual({snoMedCode: {invalid: true}});
  });
});
