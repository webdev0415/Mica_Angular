import { AbstractControl, ValidatorFn } from "@angular/forms";
import * as _ from "lodash";

export function minMax(min: number, max: Number): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    let v = control.value;
    if (!_.isNumber(v)) v = Number(v);
    return !_.isNumber(v) || (v >= min && v <= max)
      ? null
      : {"Invalid value for range": v};
  };
}
