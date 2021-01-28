import {FormControl} from "@angular/forms";
import {bodyPartsValidator} from "./bodyParts";

describe("bodyParts Validator", () => {
  it("validates type", () => {
     const formControl = new FormControl("17");
     expect(bodyPartsValidator(formControl)).toEqual({type: true});
  });
  it("validates length", () => {
    const formControl = new FormControl([]);
    expect(bodyPartsValidator(formControl)).toEqual({length: "short"});
  });
  it("validates value types", () => {
    const formControl = new FormControl([1, 2, "3"]);
    expect(bodyPartsValidator(formControl)).toEqual({type: true});
  });
  it("validates required", () => {
    const formControl = new FormControl([""]);
    expect(bodyPartsValidator(formControl)).toEqual({required: true});
  });
});
