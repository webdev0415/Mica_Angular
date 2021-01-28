import {AuthService} from "../../services";
import {AuthServiceStub} from "../../../test/services-stubs/auth.service.stub";
import {TestBed} from "@angular/core/testing";
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from "@angular/router";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {of} from "rxjs/observable/of";
import {MainGuard} from "./main.guard";
import {defaultState} from "../../app.config";
import {NgRedux} from "@angular-redux/store";

const mockRouter = {
  navigate: () => {return true}
};
const mockRedux = {
  getState: (): State.Root => {return {...defaultState}},
  select: (selector) => of(selector(defaultState)),
  dispatch: (arg: any) => {
  }
};

describe("MainGuard", () => {
  let guard: MainGuard;
  let authService: AuthService;
  let redux: NgRedux<State.Root>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MainGuard,
        {provide: AuthService, useClass: AuthServiceStub},
        {provide: Router, useValue: mockRouter},
        {provide: NgRedux, useValue: mockRedux}
      ]
    });
    guard = TestBed.get(MainGuard);
    authService = TestBed.get(AuthService);
    redux = TestBed.get(NgRedux);
  });

  it("canActivate", () => {
    expect(guard.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)).toBeFalsy();
  });

  it("canActivate", () => {
    spyOn(redux, "getState").and.returnValue({global: {bootstrapped: true}});
    spyOn(authService, "isAuthenticated").and.returnValue(true);
    expect(guard.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)).toBeTruthy();
  });

  it("canActivate", () => {
    spyOn(redux, "getState").and.returnValue({global: {bootstrapped: true}});
    authService.auth0State = new BehaviorSubject({} as any);
    spyOn(authService, "isAuthenticated").and.returnValue(false);
    expect(guard.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)).toBeFalsy();
  });
});
