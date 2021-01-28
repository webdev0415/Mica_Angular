/**
 * Created by sergeyyudintsev on 19/02/2018.
 */
import {TestBed, async, inject} from "@angular/core/testing";
import {BaseRequestOptions, ConnectionBackend, Http} from "@angular/http";
import {MockBackend} from "@angular/http/testing";
import {AuthService} from "./auth.service";
import {AUTH_CONFIG, authConfig, defaultState} from "../app.config";
import {NgRedux} from "@angular-redux/store";
import * as _ from "lodash";
import {RouterTestingModule} from "@angular/router/testing";
import {of} from "rxjs/observable/of";
import {ErrorObservable} from "rxjs/observable/ErrorObservable";
import Data = MICA.User.Data;
import {JwtHelperService, JwtModule} from "@auth0/angular-jwt";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject} from "rxjs";
const authResult = {
  idToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
};
const state = _.cloneDeep(defaultState);
const mockRedux = {
  getState: () => state,
  select: (selector) => of(selector(defaultState)),
  dispatch: (arg: any) => {
  }
};
describe("AuthService", () => {
  let service: AuthService;
  let jwtHelper: JwtHelperService;
  let redux: NgRedux<State.Root>;
  let mockBackend: MockBackend;
  beforeEach(() => {
    (window as any).Auth0Lock = function () {};
    (window as any).Auth0Lock.prototype.on = function () {};

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        MockBackend,
        BaseRequestOptions,
        JwtHelperService,
        {provide: NgRedux, useValue: mockRedux},
        { provide: AUTH_CONFIG, useValue: authConfig },
        {
          provide: HttpClient,
          useFactory: (backend: ConnectionBackend, defaultOptions: BaseRequestOptions) => new Http(backend, defaultOptions),
          deps: [MockBackend, BaseRequestOptions]
        }
      ],
      imports: [
        RouterTestingModule,
        JwtModule.forRoot({
          config: {
            tokenGetter: () => {
              return "";
            }
          }
        })
      ]
    });
  });

  beforeEach(async(() => {
    service = TestBed.get(AuthService);
    redux = TestBed.get(NgRedux);
    mockBackend = TestBed.get(MockBackend);
    jwtHelper = TestBed.get(JwtHelperService);
  }));

  it("should create", () => {
    expect(service).toBeTruthy();
  });

  it("init", () => {
    spyOn(service, "isAuthenticated").and.returnValue(true);
    const auth0StateSpy = spyOn(service.auth0State, "next").and.callThrough();
    service["init"]();
    expect(auth0StateSpy).toHaveBeenCalled();
  });

  it("onAuthenticated", () => {
    const s = {...defaultState};
    Object.assign(s, {user: {email: "email"}});
    spyOn<any>(service, "MITAUserData").and.returnValue(of({}));
    spyOnProperty<any>(service, "state", "get").and.returnValue(s);
    const navigateSpy = spyOn(service["router"], "navigate").and.callThrough();
    service["onAuthenticated"](authResult);
    localStorage.removeItem("id_token.MICA");
    expect(navigateSpy).toHaveBeenCalled();
  });

  it("onAuthenticated", () => {
    const s = {...defaultState};
    const email = "email";
    Object.assign(s, {user: {email: email}});
    spyOn<any>(service, "MITAUserData").and.returnValue(of({}));
    spyOnProperty<any>(service, "state", "get").and.returnValue(s);
    spyOnProperty<any>(service, "email", "get").and.returnValue(email);
    const navigateSpy = spyOn(service["router"], "navigate").and.callThrough();
    service["onAuthenticated"](authResult);
    localStorage.removeItem("id_token.MICA");
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it("onAuthenticated", () => {
    const err = {
      name: "TimeoutError",
      message: ""
    };
    const auth0StateSpy = spyOn(service["auth0State"], "next").and.callThrough();
    spyOn<any>(service, "MITAUserData").and.returnValue(ErrorObservable.create(err));
    service["onAuthenticated"](authResult);
    localStorage.removeItem("id_token.MICA");
    expect(auth0StateSpy).toHaveBeenCalled();
  });

  it("onAuthenticated", () => {
    const err = {
      name: "InternalError",
      message: ""
    };
    const auth0StateSpy = spyOn(service["auth0State"], "next").and.callThrough();
    spyOn<any>(service, "MITAUserData").and.returnValue(ErrorObservable.create(err));
    service["onAuthenticated"](authResult);
    localStorage.removeItem("id_token.MICA");
    expect(auth0StateSpy).toHaveBeenCalled();
  });

  it("isAuthenticated$", () => {
    service.auth0State = new BehaviorSubject({email: "email"} as Data);
    const isAuthenticatedSpy = spyOn(service, "isAuthenticated").and.callThrough();
    service.isAuthenticated$.subscribe(val => {
      expect(val).toBeFalsy();
      expect(isAuthenticatedSpy).toHaveBeenCalled();
    });
  });

  it("apiConfig", () => {
    expect(service["apiConfig"]).toBeDefined();
  });

  it("email", () => {
    spyOnProperty<any>(service, "token", "get").and.returnValue("token");
    expect(() => service["email"]).toThrow();
  });

  it("isAuthenticated$", () => {
    service.isAuthenticated$.subscribe(val => {
      expect(val).toBeFalsy();
    });
  });

  it("showWidget", () => {
    service["lock"] = {show: () => {}} as any;
    const showSpy = spyOn<any>(service["lock"], "show").and.callThrough();
    service.showWidget();
    expect(showSpy).toHaveBeenCalled();
  });

  it("logout", () => {
    const nextSpy = spyOn(service.auth0State, "next").and.callThrough();
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();
    service.logout();
    expect(nextSpy).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it("transformUserData", () => {
    const data = {
      user_id: 1,
      role_id: 1,
      role_name: "role_name",
      email: "email",
      name: "name",
      surname: "surname",
      created_on: 1
    };
    expect(service["transformUserData"](data).userID).toEqual(data.user_id);
  });

  it("email", () => {
    spyOnProperty<any>(service, "token", "get").and.returnValue(null);
    expect(service["email"]).toEqual("");
  });

  it("onAuthenticatedError", () => {
    const nextSpy = spyOn(service.auth0State, "next").and.callThrough();
    const err = {
      name: "error",
      json: () => {
        return {
          statusCode: "code",
          state: "status",
          message: "message"
        }
      }
    };
    service["onAuthenticatedError"](err);
    expect(nextSpy).toHaveBeenCalled();
  });

  it("onEsc", () => {
    const evt = {
      keyCode: 27,
      stopPropagation: () => {}
    };
    service["onEsc"](evt as any);
  });

  it("onEsc", () => {
    const evt = {
      keyCode: 28,
      stopPropagation: () => {}
    };
    service["onEsc"](evt as any);
  });

  it("isAuthenticated", () => {
    spyOn(jwtHelper, "isTokenExpired").and.returnValue(false);
    const u = {
      email: "email"
    };
    expect(service.isAuthenticated(u as any)).toBeTruthy();
  });

  it("MITAUserData", () => {
    expect(service["MITAUserData"]("email")).toBeDefined();
  });

});
