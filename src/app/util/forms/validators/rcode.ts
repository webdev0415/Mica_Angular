import { FormControl, ValidatorFn } from "@angular/forms";
import * as _ from "lodash";

export function rCode(control: FormControl): {[key: string]: any} | null {
  const value: string[] = control.value;
  const re: RegExp = new RegExp("^[A-Z]+.*");

  if (!value)
    return null;
  const err = value.find(v => !(v && _.isString(v) && re.test(v)))
  return err ? { rCode: {invalid: true}} : null
};
