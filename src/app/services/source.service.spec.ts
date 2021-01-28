import * as _ from "lodash";
import { TestBed, fakeAsync } from "@angular/core/testing";
import { NgRedux } from "@angular-redux/store";
import { defaultState } from "app/app.config";
import { SourceService } from "./source.service";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";

const state = _.cloneDeep(defaultState);

const mockRedux = {
  getState: () => state,
  dispatch: () => {
  }
};

describe("SourceService", () => {
  let service: SourceService;
  let redux: NgRedux<State.Root>;
  let mockBackend: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SourceService,
        {provide: NgRedux, useValue: mockRedux}
      ],
      imports: [
        HttpClientTestingModule
      ]
    });
    service = TestBed.get(SourceService);
    redux = TestBed.get(NgRedux);
    mockBackend = TestBed.get(HttpTestingController);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  // it("getSourceInfo should return Source Information", () => {
  //   const response: [SourceInfo.Symptom] = [{
  //     "symptomID" : "SYMPT0000341",
  //     "sourceInformation": [{
  //       "sources" : ["EarDischarge"],
  //       "sourceType" : "",
  //       "sourceRefDate" : 1534204629258
  //       }]
  //     }];

  //   service.getSourceInfo("icd10Code", "MICA").subscribe(res => {
  //     expect(res).toEqual({
  //       icd10Code: "icd10Code",
  //       source: "MICA",
  //       state: undefined,
  //       data: response
  //     } as SourceInfo.Response );
  //   });
  //   mockBackend.expectOne(() => true).flush(response);
  // });

  // it("getSourceInfo", () => {
  //   expect(() => service.getSourceInfo("", "MICA")).toThrow();
  // });

  // it("getSourceInfo", () => {
  //   expect(service.getSourceInfo("code", "MICA", "PENDING")).toBeDefined();
  // });

  it("searchSymptomSources", fakeAsync(() => {
    const response: string[] =  ["key", "key"];
    service.searchSymptomSources("key").subscribe(res => {
      expect(res).toEqual(response);
    });
    mockBackend.expectOne(() => true).flush(response);
    mockBackend.verify();
  }));

  it("getSymptomSourcesByIllness", fakeAsync(() => {
    expect(service.getSymptomSourcesByIllness).toBeDefined();
  }));

  it("addSymptomSource", fakeAsync(() => {
    expect(service.addSymptomSource(
      <SourceInfo.Source>{ source: "source", sourceType: "type", sourceID: 1 },
    )).toBeDefined();
  }))
});
