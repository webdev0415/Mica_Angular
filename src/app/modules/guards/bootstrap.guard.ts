import { Injectable } from "@angular/core";
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { of, from } from "rxjs";
import {filter, switchMap} from "rxjs/operators";

@Injectable()
export class BootstrapGuard implements CanActivate {

  constructor(private auth: AuthService,
              private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {

    if (this.auth.auth0State.getValue()) {
      return of(true);
    } else {
      this.auth.showWidget();
      return this.auth.auth0State
        .pipe(
          filter(userData => !!userData), // guard won't receive null values
          switchMap(this.onUserData.bind(this))
        );
    }
  }

  private onUserData(userData: any) {
    if (userData instanceof Error) {
      return from(this.router.navigate(["error"], {queryParams: {msg: userData.message}}));
    } else {
      return of(true);
    }
  }
}
