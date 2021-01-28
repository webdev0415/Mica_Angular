import { FormControl, ValidatorFn } from "@angular/forms";
import * as _ from "lodash";

export function snomedName(control: FormControl): {[key: string]: any} | null {
  const value: string = control.value;
  // const re: RegExp = new RegExp("[\w\d]+.*");
  return value === "" || _.isString(value)
    ? null
    : { rCode: {invalid: true}}
};
