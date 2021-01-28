import * as _ from "lodash";
import {async, TestBed} from "@angular/core/testing";
import {NgRedux} from "@angular-redux/store";
import {defaultState} from "./../app.config";
import {EcwService} from "./ecw.service";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
const fakeEcwIllnessData = require("../../test/data/ecwIllnessesData.json");

const state = _.cloneDeep(defaultState);

const mockRedux = {
  getState: () => state,
  dispatch: () => {
  }
};

describe("EcwService", () => {
  let service: EcwService;
  let redux: NgRedux<State.Root>;
  let mockBackend: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EcwService,
        {provide: NgRedux, useValue: mockRedux}
      ],
      imports: [HttpClientTestingModule]
    });
    service = TestBed.get(EcwService);
    redux = TestBed.get(NgRedux);
    mockBackend = TestBed.get(HttpTestingController);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should return Illnesses", () => {
    const response: ECW.Response = {
      content: [],
      first: true,
      pagenumber: 0,
      pageSize: 20,
      elementsInPage: 20,
      last: false,
      totalElements: 2388,
    };

    service.getIllnesses(1, 20)
      .subscribe(res => expect(res).toEqual(response));
    mockBackend.expectOne(() => true).flush(response);
  });


  it("should return userData", () => {
    const response = fakeEcwIllnessData;
    service.getIllnessByIcd10Code("code")
      .subscribe(res => expect(res).toEqual(response.userData));
    mockBackend.expectOne(() => true).flush(response);
  });

  it("getIllnessByIcd10Code", () => {
    const code = "code";
    const source = "NLP";
    service.getIllnessByIcd10Code(code, source)
      .subscribe(data => {
        expect(data).toEqual({});
      });
    mockBackend.expectOne(() => true).flush({userData: {}});
  });

  it("getIllnessByIcd10Code", () => {
    const code = "code";
    const source = null;
    service.getIllnessByIcd10Code(code, source)
      .subscribe(data => {
        expect(data).toEqual({});
      });
    mockBackend.expectOne(() => true).flush({userData: {}});
  });

});
