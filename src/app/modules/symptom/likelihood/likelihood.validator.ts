import { AbstractControl, ValidatorFn } from "@angular/forms";
import * as _ from "lodash";

export function likelihoodValidator(control: AbstractControl): {[key: string]: any} | null {
  const value = control.value;
  const valid = _.isNumber(value) && value >= 0 && value <= 100;
  return valid ? null : {pattern: true};
};
