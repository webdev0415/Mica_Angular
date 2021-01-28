import {TestBed, inject, async, fakeAsync, tick} from "@angular/core/testing";
import * as _ from "lodash";
import {IdleDetectorService} from "./idle-detector.service";
import {BaseRequestOptions, ConnectionBackend, Http} from "@angular/http";
import {MockBackend} from "@angular/http/testing";
import {AuthService} from "./auth.service";
import {AuthServiceStub} from "../../test/services-stubs/auth.service.stub";
import {AUTH_CONFIG, defaultState} from "../app.config";
import {InjectionToken} from "@angular/core";
import {NgRedux} from "@angular-redux/store";
import {Router} from "@angular/router";
import {of} from "rxjs/observable/of";
import {HttpClient} from "@angular/common/http";

const state = _.cloneDeep(defaultState);
const mockRouter = {
  navigate: () => {}
};

const mockRedux = {
  getState: (): State.Root => state,
  dispatch: (arg: any) => {
  }
};

describe("IdleDetectorService", () => {
  let service: IdleDetectorService;
  let redux: NgRedux<State.Root>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        IdleDetectorService,
        MockBackend,
        BaseRequestOptions,
        {provide: NgRedux, useValue: mockRedux},
        {provide: Router, useValue: mockRouter},
        {provide: AuthService, useClass: AuthServiceStub},
        {provide: AUTH_CONFIG, useValue: new InjectionToken("auth.config")},
        {
          provide: HttpClient,
          useFactory: (backend: ConnectionBackend, defaultOptions: BaseRequestOptions) => new Http(backend, defaultOptions),
          deps: [MockBackend, BaseRequestOptions]
        }
      ]
    });
    redux = TestBed.get(NgRedux);
  });

  beforeEach(async(() => {
    service = TestBed.get(IdleDetectorService);
  }));

  it("should create", () => {
    expect(service).toBeTruthy();
  });

  it("start", () => {
    service.start();
  });

  it("stop", () => {
    service.stop();
  });

  it("stop", () => {
    service["resetter"] = of("").subscribe();
    service["timerSrc"] = setInterval(() => {}, 0);
    service.stop();
  });

  it("resetTimer", () => {
    service["timerSrc"] = setInterval(() => {}, 0);
    service["resetTimer"]();
    expect(service["timerSrc"]).toBeDefined();
  });

  it("start", () => {
    const resetTimerSpy = spyOn<any>(service, "resetTimer").and.callThrough();
    service["activity"] = of(new Event(""));
    service.start();
    expect(resetTimerSpy).toHaveBeenCalled();
  });

  it("resetTimer", () => {
    spyOnProperty<any>(service, "timer", "get").and.returnValue(null);
    service["resetTimer"]();
    expect(service["timerSrc"]).toEqual(service["timer"]);
  });

  it("timer", fakeAsync(() => {
    const s = {...defaultState};
    const navigateSpy = spyOn(service["router"], "navigate").and.callThrough();
    Object.assign(s, {global: {
        idleTime: 100
      }});
    spyOn(redux, "getState").and.returnValue(s);
    const timer = service["timer"];
    tick(100);
    expect(navigateSpy).toHaveBeenCalled();
    clearInterval(timer);
  }));
});
