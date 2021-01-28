import { isReviewer } from "./../../state/user/user.selectors";
import { Injectable } from "@angular/core";
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { NgRedux } from "@angular-redux/store";

@Injectable()
export class ReviewerGuard implements CanActivate {

  constructor(private s: NgRedux<State.Root>,
              private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | boolean {

    if (!isReviewer(this.s.getState())) {
      this.router.navigate([""]);
    }
    return true;
  }
}
