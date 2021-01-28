import { NgRedux } from "@angular-redux/store";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router } from "@angular/router";
import { SET_ACTIVE_GROUP } from "../../../state/nav/nav.actions";
import { activeIllnessID } from "../../../state/workbench/workbench.selectors";

@Injectable()
export class EditorLoaderService {

  constructor(private s: NgRedux<State.Root>,
              private router: Router) { }

  dispatchSymptomGroup(sgID: string): boolean | Promise<boolean> {
    const hasActiveIllness = !!activeIllnessID(this.s.getState());
    if (hasActiveIllness) {
      this.s.dispatch({
        type: SET_ACTIVE_GROUP,
        group: sgID
      });
    } else {
      this.router.navigate(["/workbench/select-illness"]);
    }
    return true;
  }

}
