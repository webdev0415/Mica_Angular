import {FormControl, FormGroup} from "@angular/forms";
import {illnessErrorTracker} from "./illness";

describe("illness validators", () => {
  it("illnessErrorTracker", () => {
    const formGroup = new FormGroup({name: new FormControl("")});
    expect(illnessErrorTracker(formGroup)).toEqual({});
  });
  it("illnessErrorTracker", () => {
    const formControl = new FormControl("");
    formControl.setErrors({required: true});
    const formGroup = new FormGroup({groupsComplete: formControl});
    expect(illnessErrorTracker(formGroup)).toBeDefined();
  });
  it("illnessErrorTracker", () => {
    const formControl = new FormControl("");
    formControl.setErrors({required: true});
    const formGroup = new FormGroup({controlName: formControl});
    expect(illnessErrorTracker(formGroup)).toBeDefined();
  });
});
