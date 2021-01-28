import {TestBed} from "@angular/core/testing";
import * as _ from "lodash";

import {UniquenessService} from "./uniqueness.service";
import {NgRedux} from "@angular-redux/store";
import {defaultState} from "../../../app.config";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
const state = _.cloneDeep(defaultState);

const mockRedux = {
  getState: (): State.Root => state,
  dispatch: (arg: any) => {}
};

describe("UniquenessService", () => {
  let service: UniquenessService;
  let mockBackend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UniquenessService,
        {provide: NgRedux, useValue: mockRedux}
      ],
      imports: [HttpClientTestingModule]
    });

    service = TestBed.get(UniquenessService);
    mockBackend = TestBed.get(HttpTestingController);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should checkUniqueness", () => {
    const data = {
      icd10Code: "someCode",
      version: 1,
      includetime: false
    };
    const sampleRes = ["A", "B"];

    service.checkUniqueness(data.icd10Code, data.version, data.includetime).subscribe(res => expect(res).toEqual(sampleRes));
    mockBackend.expectOne(() => true).flush(sampleRes);
  });

  it("checkUniqueness", () => {
    expect(service.checkUniqueness("code", 1, true)).toBeDefined();
  });
});
