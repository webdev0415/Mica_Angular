import {AbstractControl} from "@angular/forms";
import * as _ from "lodash";

export function whitespacesValidator(control: AbstractControl): {[key: string]: any} | null {
  const value = _.clone(control.value);
  if (control.value && !_.trim(value)) return {whitespace: true};
  return null;
}
