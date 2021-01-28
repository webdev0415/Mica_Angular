import {FormControl} from "@angular/forms";
import {rCode} from "./rcode";

describe("rcode", () => {
  it("validates not empty rcode", () => {
    const formControl = new FormControl(["ABC"]);
    expect(rCode(formControl)).toEqual(null);
  });
  it("validates empty rcode", () => {
    const formControl = new FormControl(null);
    expect(rCode(formControl)).toEqual(null);
  });
  it("validates invalid rcode", () => {
    const formControl = new FormControl(["abc"]);
    expect(rCode(formControl)).toEqual({rCode: {invalid: true}});
  });
});
