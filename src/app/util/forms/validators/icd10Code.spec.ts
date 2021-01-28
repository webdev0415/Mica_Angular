import {FormControl} from "@angular/forms";
import { icd10CodeValidator } from "./icd10Code";

const invalid = {icd10Code: {invalid: true}};

describe("icd10CodeValidator", () => {
  it("validates empty", () => {
    const formControl = new FormControl("");
    expect(icd10CodeValidator(formControl)).toEqual(null);
  });
  it("validates string < 3", () => {
    const formControl = new FormControl("12");
    expect(icd10CodeValidator(formControl)).toEqual(invalid);
  });
  it("validates special char", () => {
    const formControl = new FormControl("AB/?");
    expect(icd10CodeValidator(formControl)).toEqual(invalid);
  });

  it("validates icdCode", () => {
    const formControl = new FormControl("AB1");
    expect(icd10CodeValidator(formControl)).toEqual(null);
    formControl.setValue("     AB1     ");
    expect(icd10CodeValidator(formControl)).toEqual(null);
    formControl.setValue("123");
    expect(icd10CodeValidator(formControl)).toEqual(null);
    formControl.setValue("A123.34");
    expect(icd10CodeValidator(formControl)).toEqual(null);
    formControl.setValue(".34");
    expect(icd10CodeValidator(formControl)).toEqual(null);
  });

  it("validates string < 3", () => {
    const formControl = new FormControl("12");
    expect(icd10CodeValidator(formControl)).toEqual(invalid);
  });
  // it("validates invalid rcode", () => {
  //   const formControl = new FormControl(["abc"]);
  //   expect(icd10CodeValidator(formControl)).toEqual({rCode: {invalid: true}});
  // });
});
