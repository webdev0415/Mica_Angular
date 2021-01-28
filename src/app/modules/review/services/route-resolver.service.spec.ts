import {TestBed, inject} from "@angular/core/testing";
import * as _ from "lodash";

import {RouteResolverService} from "./route-resolver.service";
import {EditorLoaderService} from "../../workbench/services/editor-loader.service";
import {EditorLoaderServiceStub} from "../../../../test/services-stubs/editor-loader.service.stub";
import {RequiredDataService} from "./required-data.service";
import {defaultState} from "../../../app.config";
import {NgRedux} from "@angular-redux/store";
import {RequiredDataServiceStub} from "../../../../test/services-stubs/required-data.service.stub";
import {ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
const state = _.cloneDeep(defaultState);

const mockRedux = {
  getState: (): State.Root => state,
  dispatch: (arg: any) => {
  }
};


describe("RouteResolverService", () => {
  let service: RouteResolverService;
  let requiredDataService: RequiredDataServiceStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RouteResolverService,
        {provide: EditorLoaderService, useClass: EditorLoaderServiceStub},
        {provide: RequiredDataService, useClass: RequiredDataServiceStub},
        {provide: NgRedux, useValue: mockRedux}
      ]
    });
    service = TestBed.get(RouteResolverService);
    requiredDataService = TestBed.get(RequiredDataService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should resolve", () => {
    expect(service.resolve({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)).toEqual(true);
  });
});
