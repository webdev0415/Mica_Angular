import {FormControl} from "@angular/forms";
import {multiplierValidator} from "./multiplier.validator";

describe("multiplier validator", () => {
  it("should validate type", () => {
    const formControl = new FormControl("");
    expect(multiplierValidator(formControl)).toEqual({type: true});
  });

  it("should validate type", () => {
    const formControl = new FormControl([true]);
    expect(multiplierValidator(formControl)).toEqual({type: true});
  });
});
