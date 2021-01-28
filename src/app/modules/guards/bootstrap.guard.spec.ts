import {BootstrapGuard} from "./bootstrap.guard";
import {AuthService} from "../../services";
import {AuthServiceStub} from "../../../test/services-stubs/auth.service.stub";
import {TestBed} from "@angular/core/testing";
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from "@angular/router";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import Data = MICA.User.Data;

const mockRouter = {
  navigate: () => {return true}
};
describe("BootstrapGuard", () => {
  let guard: BootstrapGuard;
  let authService: AuthService;
  let router: Router;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BootstrapGuard,
        {provide: AuthService, useClass: AuthServiceStub},
        {provide: Router, useValue: mockRouter}
      ]
    });
    guard = TestBed.get(BootstrapGuard);
    authService = TestBed.get(AuthService);
    router = TestBed.get(Router);
  });
  it("canActivate", () => {
    authService.auth0State = new BehaviorSubject({} as Data);
    guard.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
      .subscribe(val => {
        expect(val).toBeTruthy();
      })
  });

  it("canActivate", () => {
    authService.auth0State = new BehaviorSubject({} as any);
    spyOn(authService.auth0State, "getValue").and.returnValue(null);
    guard.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot).subscribe(val => {
      expect(val).toBeTruthy();
    });
  });

  it("onUserData", () => {
    const err = new Error("message");
    spyOn(router, "navigate").and.returnValue([]);
    expect(guard["onUserData"](err)).toBeDefined();
  });
});
