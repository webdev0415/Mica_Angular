/**
 * Created by sergeyyudintsev on 09.10.17.
 */
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { of } from "rxjs/observable/of";

@Injectable()
export class AuthServiceStub {
  auth0State: BehaviorSubject<MICA.User.Data | null> = new BehaviorSubject(null);

  get isAuthenticated$(): Observable<boolean> {
    return of(this.isAuthenticated({} as MICA.User.Data))
  };

  isAuthenticated(u: MICA.User.Data): boolean {
    return true;
  };

  logout() {
  }

  showWidget() {
  }

  resetApp() {
  }
}
