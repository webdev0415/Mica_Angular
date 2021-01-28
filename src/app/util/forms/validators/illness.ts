import { FormGroup, FormControl } from "@angular/forms";
import * as _ from "lodash";

export function illnessErrorTracker(illFG: FormGroup): Task.IllnessRootError {
  return _.reduce(illFG.controls, (errs, ctrl: FormControl, name: string) => {
    if (!ctrl.errors) return errs;
    switch (name) {
      case "groupsComplete":
        return _.assign({[name]: "incomplete"}, errs);
      default:
        console.error("Unable to determine illness errors");
        return errs;
    }
  }, {} as Task.IllnessRootError);
};
