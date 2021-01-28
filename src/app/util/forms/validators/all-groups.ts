import { FormControl, ValidatorFn } from "@angular/forms";
import * as _ from "lodash";

export function allGroupsComplete(groupIDAll: string[]): ValidatorFn {
  return (control: FormControl): {[key: string]: any} | null => {
    const value: string[] = control.value;
    if (!_.isArray(value)) throw new Error("All groups validator can only be used in string[]");
    return _.every(groupIDAll, s => !!~_.indexOf(value, s))
      ? null : {groupsComplete: {incomplete: true}};
  };
};
