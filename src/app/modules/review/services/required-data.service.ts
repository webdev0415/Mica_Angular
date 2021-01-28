import { activeIllnessValue } from "./../../../state/workbench/workbench.selectors";
import { NgRedux } from "@angular-redux/store";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router } from "@angular/router";
import { Observable } from "rxjs";

@Injectable()
export class RequiredDataService {

  constructor(private s: NgRedux<State.Root>,
              private router: Router) { }

  hasActiveIllness(): boolean {
    const hasActiveIllness = activeIllnessValue(this.s.getState());
    if (!hasActiveIllness) this.router.navigate([""]);
    return true;
  }

}
