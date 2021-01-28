/* tslint:disable:no-unused-variable */

import {TestBed, async, inject} from "@angular/core/testing";
import * as _ from "lodash";
import {TitleService} from "./title.service";
import {RouterTestingModule} from "@angular/router/testing";
import {Title} from "@angular/platform-browser";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {defaultState} from "../../../app.config";
import {Observable} from "rxjs";
import {NgRedux} from "@angular-redux/store";
import {of} from "rxjs/observable/of";

const state = _.cloneDeep(defaultState);
const mockRedux = {
  getState: () => {
    return defaultState
  },
  select: (selector) => of(selector(defaultState)),
  dispatch: (arg: any) => {}
};
describe("TitleService", () => {
  let title: Title;
  let service: TitleService;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        TitleService,
        {provide: NgRedux, useVaqlue: mockRedux}
      ],
      imports: [
        RouterTestingModule
      ]
    });
  }));

  beforeEach(() => {
    title = TestBed.get(Title);
    service = TestBed.get(TitleService);
    router = TestBed.get(Router);
  });

  it("should create", () => {
    expect(service).toBeTruthy();
    service.ngOnDestroy();
  });

  it("routerTitle", () => {
    const titleParts = ["first", "second"];
    const mockGetTitle = spyOn(service as any, "getTitle").and.returnValue(titleParts);
    expect(service.routerTitle).toEqual(titleParts.join("-"));
  });

  it("pageTitle", () => {
    const titleParts = ["first", "second"];
    const mockSetTitle = spyOn(title, "setTitle").and.callThrough();
    service.pageTitle = titleParts;
    expect(mockSetTitle.calls.mostRecent().args[0]).toContain(titleParts[0]);
  });

  it("getTitle", () => {
    const parent = {snapshot: {data: {title: "title"}}};
    expect(service["getTitle"](null, parent).length).toEqual(1);
  });

  it("lastChild", () => {
    expect(() => service["lastChild"]).toThrow();
  });

  it("pageHasOwnTitle", () => {
    spyOnProperty<any>(service, "lastChild", "get").and.returnValue({snapshot: {data: {hasSection: true}}});
    expect(service["pageHasOwnTitle"]).toEqual(true);
  });

  it("pageHasOwnTitle", () => {
    spyOnProperty<any>(service, "lastChild", "get").and.returnValue(null);
    expect(service["pageHasOwnTitle"]).toEqual(false);
  });

  it("lastChild", () => {
    const children = [{children: [{name: "name"}]} as any];
    expect(service["getChildren"](children)).toBeDefined();
  });

  it("lastChild", () => {
    spyOn<any>(service, "getChildren").and.returnValue([{}]);
    expect(service["lastChild"]).toBeDefined();
  });

  it("setAppTitle", () => {
    const appTitle = "title";
    service["setAppTitle"]("title");
    expect(service["appTitle"]).toEqual(appTitle);
  });

  it("isNavigationEnd", () => {
    const navigationEnd = new NavigationEnd(1, "", "");
    expect(service["isNavigationEnd"](navigationEnd)).toBeTruthy();
  });

  it("setPageTitle", () => {
    spyOnProperty<any>(service, "pageHasOwnTitle", "get").and.returnValue(false);
    const setAppTitleSpy = spyOnProperty(service, "pageTitle", "set").and.callThrough();
    service["setPageTitle"]();
    expect(setAppTitleSpy).toHaveBeenCalledWith([]);
  });

  it("setPageTitle", () => {
    spyOnProperty<any>(service, "pageHasOwnTitle", "get").and.returnValue(true);
    const setAppTitleSpy = spyOnProperty(service, "pageTitle", "set").and.callThrough();
    service["setPageTitle"]();
    expect(setAppTitleSpy).not.toHaveBeenCalled();
  });

  it("getChildren", () => {
    const route = [
      {
        children: []
      } as ActivatedRoute
    ];
    expect(service["getChildren"](route)).toBeDefined();
  });

  it("withoutDuplicates", () => {
    const arr = ["1", "1", "2"];
    expect(service["withoutDuplicates"](arr).length).toEqual(2);
  });

  it("withoutDuplicates", () => {
    const arr = null;
    expect(service["withoutDuplicates"](arr).length).toEqual(0);
  });

});
