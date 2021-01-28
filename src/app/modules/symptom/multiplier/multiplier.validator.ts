import { AbstractControl, ValidatorFn } from "@angular/forms";
import * as _ from "lodash";

export function multiplierValidator(control: AbstractControl): {[key: string]: any} | null {
  const value: string[] = control.value;
  if (!_.isArray(value)) return {type: true};
  if (!value.length) return {length: "short"};
  let valid;
  if (value.length === 1) {
    // multiplier with just one value either a string or a number
    if (value[0] && !_.isString(value[0]) && !_.isNumber(value[0])) return {type: true}
    valid = value[0] && value[0].length;
  } else {
    // cover foreign travel
    valid = _.some(value, (v: string | number) => v !== "");
  }
  return valid ? null : {required: true};
};
