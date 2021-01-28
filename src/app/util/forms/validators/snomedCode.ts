import { FormControl, ValidatorFn } from "@angular/forms";
import * as _ from "lodash";

export function snomedCode(control: FormControl): {[key: string]: any} | null {
  const value: string = control.value;
  const re: RegExp = new RegExp("^[0-9,]+$");
  return value === ""
  || (_.isString(value) && re.test(value))
    ? null
    : { snoMedCode: {invalid: true}}
};
