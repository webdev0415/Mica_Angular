import {TestBed} from "@angular/core/testing";
import * as _ from "lodash";
import {ApiService} from "./api.service";
import {NgRedux} from "@angular-redux/store";
import {defaultState} from "../../app.config";
import {HttpResponse} from "@angular/common/http";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
const fakeIllnesses = require("../../../test/data/illnesses.json");

const state = _.cloneDeep(defaultState);
const mockRedux = {
  getState: () => state,
  dispatch: () => {
  }
};

describe("ApiService", () => {
  let service: ApiService;
  let mockBackend: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        {provide: NgRedux, useValue: mockRedux}
      ],
      imports: [HttpClientTestingModule]
    });
    service = TestBed.get(ApiService);
    mockBackend = TestBed.get(HttpTestingController);
  });

  it("should create", () => {
    expect(service).toBeTruthy();
  });

  it("search", () => {
    const term = "term";
    const url = "https://example.com";
    const node = {
      nodeName: "name",
      icd10Code: "ICD10CODE"
    };
    const illness = fakeIllnesses[0];
    let data: any = {nodes: [node]};

    service.search(term, url)
      .subscribe(res => expect(res).toEqual([{name: node.nodeName, value: node.icd10Code}]));
    mockBackend.expectOne(() => true).flush(data);
    mockBackend.verify();

    delete data.nodes;
    data.userData = [illness];
    service.search(term, url)
      .subscribe(res => expect(res).toEqual([{name: illness.name, value: illness}]));
    mockBackend.expectOne(() => true).flush(data);
    mockBackend.verify();

    data = ["name"];
    service.search(term, url)
      .subscribe(res => expect(res).toEqual([{name: data[0], value: data[0]}]));
    mockBackend.expectOne(() => true).flush(data);
    mockBackend.verify();

    service.search("", url)
      .subscribe(res => expect(res).toEqual([]))
      .unsubscribe();
  });

  it("parseResponse", () => {
    expect(() => service["parseResponse"]({get body() { throw new Error("")}} as HttpResponse<any>)).toThrow(jasmine.any(Error));
  });

  it("processSearchResult", () => {
    const result = {
      nodes: []
    };
    expect(service["processSearchResult"](result).length).toEqual(0);
  });

  it("processSearchResult", () => {
    const result = {
      userData: []
    };
    expect(service["processSearchResult"](result).length).toEqual(0);
  });

  it("processSearchResult", () => {
    const result = [{childNodes: []}];
    expect((service["processSearchResult"](result) as any).name).toBeUndefined();
  });

  it("processSearchResult", () => {
    const result = null;
    expect((service["processSearchResult"](result) as any).name).toBeUndefined();
  });

  it("processSearchResult", () => {
    const description = "description";
    const result = [{description: description}];
    expect((service["processSearchResult"](result) as any)[0].name).toEqual(description);
  });

  it("processSearchResult snomedCodes", () => {
    const res = [{fsn: "name", sctid: 12345}];
    const result: any = service["processSearchResult"](res);
    expect(result).toEqual([{name: "name", value: 12345}]);
  });

  it("pushChildNodes", () => {
    const childNodes = [
      {
        name: "name",
        description: "desc",
        childNodes: []
      }
    ];
    childNodes[0].childNodes = JSON.parse(JSON.stringify(childNodes));
    const temp = [];
    service["pushChildNodes"](childNodes, temp);
    expect(temp.length).toEqual(2);
  });

  it("pushChildNodes", () => {
    const childNodes = [
      {
        name: "name",
        description: "desc",
        childNodes: null
      }
    ];
    const temp = [];
    service["pushChildNodes"](childNodes, temp);
    expect(temp.length).toEqual(1);
  });

  it("processItems", () => {
    const items = {
      description: "desc",
      name: "name"
    };
    expect(service["processItems"](items)[0].name).toEqual("desc");
  });

});
