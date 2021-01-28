import {TestBed} from "@angular/core/testing";
import {defaultState} from "../../app.config";
import {NgRedux} from "@angular-redux/store";
import * as userSelectors from "../../state/user/user.selectors";
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from "@angular/router";
import {ReviewerGuard} from "./reviewer.guard";
const mockRedux = {
  getState: () => {return {...defaultState}}
};
const mockRouter = {
  navigate: () => {}
};
describe("Reviewer Guard", () => {
  let guard: ReviewerGuard;
  let redux: NgRedux<State.Root>;
  let router: Router;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReviewerGuard,
        {provide: NgRedux, useValue: mockRedux},
        {provide: Router, useValue: mockRouter}
      ]
    });
    guard = TestBed.get(ReviewerGuard);
    redux = TestBed.get(NgRedux);
    router = TestBed.get(Router);
  });

  it("canActivate", () => {
    spyOn(userSelectors, "isReviewer").and.returnValue(false);
    const navigateSpy = spyOn(router, "navigate").and.callThrough();
    guard.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    expect(navigateSpy).toHaveBeenCalled();
  });

  it("canActivate", () => {
    spyOn(userSelectors, "isReviewer").and.returnValue(true);
    const navigateSpy = spyOn(router, "navigate").and.callThrough();
    guard.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

});
