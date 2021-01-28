import { AbstractControl, ValidatorFn } from "@angular/forms";
import * as _ from "lodash";

export function bodyPartsValidator(control: AbstractControl): {[key: string]: any} | null {
  const value: string[] = control.value;
  if (!_.isArray(value)) return {type: true};
  if (!value.length) return {length: "short"};
  if (_.some(value, v => !_.isString(v))) return {type: true}
  if (_.some(value, v => v === "")) return {required: true}
  return null;
};
