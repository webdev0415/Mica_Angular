import { AbstractControl, ValidatorFn } from "@angular/forms";
import * as _ from "lodash";

export function rangeValidator(values: [number, number]): ValidatorFn {
  const [min, max] = values;
  return (control: AbstractControl): {[key: string]: any} | null => {
    const value = control.value;
    const valid = _.each(value, v => _.isNumber(v)) && value[0] >= min && value[1] <= max && value[0] < value[1];
    return valid ? null : {range: [`Values are not between ${min} and ${max}`]};
  };
};
