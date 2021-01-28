import { SET_USER } from "../state/user/user.actions";
import { Inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";
import { NgRedux } from "@angular-redux/store";
import * as _ from "lodash";
import { AUTH_CONFIG } from "../app.config";
import { environment } from "../../environments/environment";
import { map, timeout } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { JwtHelperService } from "@auth0/angular-jwt";
import { setCurrentApp } from "../state/global/global.actions";

// Avoid name not found warnings
declare var Auth0Lock: any;

@Injectable()
export class AuthService {
  // Configure Auth0
  /* istanbul ignore next */
  private widgetOptions: Auth0LockConstructorOptions = {
    auth: {
      redirect: false,
      params: {
        scope: "email openid"
      },
      sso: false
    },
    autoclose: true,
    languageDictionary: {
      title: `${environment.appTitle}`,
      error: {
        login: {
          "lock.invalid_email_password": "Not Authorized for Access"
        }
      }
    },
    theme: {
      logo: `/MICA/assets/img/body/body-icon.png`,
      primaryColor: "#0275d8"
    },
    rememberLastLogin: false
  };
  auth0State: BehaviorSubject<MICA.User.Data | null> = new BehaviorSubject(null);
  private get state() { return this.s.getState() }
  private get apiConfig() { return this.state.global.api.MITA; }
  private get apiTimeout() { return this.state.global.apiTimeout; }
  private lock: Auth0LockStatic;
  private onEsc = (e: KeyboardEvent) => {
    if (e.keyCode === 27) {
      e.stopPropagation();
    }
  };

  constructor(@Inject(AUTH_CONFIG) private authConfig: MICA.Auth0Configuration,
              private s: NgRedux<State.Root>,
              private jwtHelper: JwtHelperService,
              private http: HttpClient,
              private router: Router) {
    window.addEventListener("keydown", this.onEsc, true);
    this.init();
  }

  isAuthenticated(u: MICA.User.Data): boolean {
    const tokenExpired = this.jwtHelper.isTokenExpired();
    return !tokenExpired && !!u && !!u.email;
  };
  get isAuthenticated$(): Observable<boolean> { return this.auth0State.pipe(map(u => u ? this.isAuthenticated(u) : false)) };
  private get email(): string { return this.token ? this.jwtHelper.decodeToken(this.token)["email"] : ""; }
  private get token() { return localStorage.getItem("id_token.MICA"); }

  showWidget() {
    this.lock.show();
  };

  // auth0Logout(path: string): void {
    // const origin = _.get(this.platformLocation, ["location", "origin"]);
    // this.lock.logout({
    //   returnTo: `https://${origin}/${path})}`
    // });
    // const url = `https://advi.auth0.com/v2/logout?returnTo=${encodeURIComponent(origin + "/" + path)}&client_id=${this.authConfig.clientID}`;
    // window.location.href = url;
  // }

  logout() {
    localStorage.removeItem("id_token.MICA");
    this.auth0State.next(null);
    this.s.dispatch({
      type: SET_USER
    });
  };

  resetApp() {
    this.s.dispatch(setCurrentApp());
  };

  private MITAUserData(email: string): Observable<MICA.User.Data> {
    const url = _.join([this.apiConfig.userByEmail, email], "/");
    return this.http.get(url)
      .pipe(
        timeout(this.apiTimeout),
        map(this.transformUserData)
    )
  }

  private init() {
    this.lock = new Auth0Lock(this.authConfig.clientID, this.authConfig.domain, this.widgetOptions);
    if (this.isAuthenticated(this.state.user)) this.auth0State.next(this.state.user);

    this.lock.on("authenticated", this.onAuthenticated.bind(this));
  }

  private onAuthenticated(authResult: any) {
    window.removeEventListener("keydown", this.onEsc, true);
    localStorage.setItem("id_token.MICA", authResult.idToken);
    this.MITAUserData(this.email)
      .subscribe(
        u => {
          this.auth0State.next(u);
          const userStateEmail = this.state.user.email;
          const userHasChanged = !userStateEmail || userStateEmail !== this.email;
          if (userHasChanged) {
            this.router.navigate(["bootstrap"]);
          }
        },
        this.onAuthenticatedError.bind(this));
  }

  private transformUserData(data: MICA.User.MICAData): MICA.User.Data {
    return {
      userID: data.user_id,
      roleID: data.role_id,
      roleName: data.role_name.toLowerCase() as MICA.User.RoleName,
      name: data.name,
      surname: data.surname,
      email: data.email
    };
  }

  private onAuthenticatedError(err: any) {
    const _err = _.cloneDeep(err);
    if (_err.name === "TimeoutError") {
      _err.message = "MITA is not responding when querying user data by email address";
      this.auth0State.next(_err);
    } else {
      try {
        console.log(err);
        _err.message = `${err.json().statusCode} ${err.json().status}: ${err.json().message}`;
        this.auth0State.next(_err);
      } catch (error) {
        console.log("error: ", error);
        _err.message = "Unable to get user data by email";
        this.auth0State.next(_err);
      }
    }
  }
}
