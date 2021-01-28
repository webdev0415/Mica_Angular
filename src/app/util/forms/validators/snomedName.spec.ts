import { FormControl } from "@angular/forms";
import { snomedName } from "./snomedName";

describe("snomedTerm", () => {

  it("validates string ", () => {
    const formControl = new FormControl("Abc123");
    expect(snomedName(formControl)).toEqual(null);
  });

  it("validates empty name", () => {
    const formControl = new FormControl("");
    expect(snomedName(formControl)).toEqual(null);
  });

  it("validates invalid name", () => {
    const formControl = new FormControl(123);
    expect(snomedName(formControl)).toEqual({rCode: {invalid: true}});
  });
});
