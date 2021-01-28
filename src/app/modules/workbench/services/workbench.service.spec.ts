import {TestBed, inject, async} from "@angular/core/testing";
import * as _ from "lodash";

import {WorkbenchService} from "./workbench.service";
import {Router} from "@angular/router";
import {defaultState} from "../../../app.config";
import {Observable} from "rxjs";
import {NgRedux} from "@angular-redux/store";
import {of} from "rxjs/observable/of";
const mockRouter = {
  navigate: jasmine.createSpy("navigate")
};
const state = _.cloneDeep(defaultState);
const mockRedux = {
  getState: (): State.Root => {
    return state
  },
  select: (selector) => of(selector(defaultState)),
  dispatch: (arg: any) => {
  }
};

describe("WorkbenchService", () => {
  let service: WorkbenchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WorkbenchService,
        {provide: NgRedux, useValue: mockRedux},
        {provide: Router, useValue: mockRouter}
      ]
    });
  });

  beforeEach(async(() => {
    service = TestBed.get(WorkbenchService)
  }));

  it("should be created", () => {
    expect(service).toBeTruthy()
  });

  it("should be created", () => {
    const currentIdx = _.findIndex(state.nav.symptomItems, item => item.path === state.nav.activeGroup);
    const nextIdx = currentIdx + 1;
    const lastIdx = state.nav.symptomItems.length - 1;
    service.goToNextSymptomGroup();
    expect(mockRouter.navigate.calls.mostRecent().args[0][1]).toEqual(state.nav.symptomItems[nextIdx].path);

    (state.nav as any).activeGroup = state.nav.symptomItems[lastIdx].path;
    service.goToNextSymptomGroup();
    expect(mockRouter.navigate.calls.mostRecent().args[0][0]).toEqual("review");
  });
});
