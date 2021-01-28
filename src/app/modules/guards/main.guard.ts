import { Injectable } from "@angular/core";
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../../services";
import { NgRedux } from "@angular-redux/store";

@Injectable()
export class MainGuard implements CanActivate {

  constructor(private s: NgRedux<State.Root>,
              private auth: AuthService,
              private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): any {

    if (!this.s.getState().global.bootstrapped) {
      this.router.navigate(["/bootstrap"], { queryParams: { returnUrl: state.url }});
      return false;
    } else if (this.auth.isAuthenticated(this.s.getState().user)) {
      return true;
    } else {
      this.router.navigate(["logout"]);
      this.auth.showWidget();
      return false;
    }
  }
}
