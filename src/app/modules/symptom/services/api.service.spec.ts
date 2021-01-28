import {TestBed} from "@angular/core/testing";
import {ApiService} from "./api.service";
import {NgRedux} from "@angular-redux/store";
import {BaseRequestOptions, ConnectionBackend, Http, ResponseOptions, Response} from "@angular/http";
import {MockBackend} from "@angular/http/testing";
import {Subscription} from "rxjs";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";

describe("ApiService", () => {
  let service: ApiService;
  let mockBackend: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        NgRedux
      ],
      imports: [HttpClientTestingModule]
    });
    service = TestBed.get(ApiService);
    mockBackend = TestBed.get(HttpTestingController);
  });
  beforeEach(() => {
    service = TestBed.get(ApiService);
  });

  it("should create", () => {
    expect(service).toBeTruthy();
  });

  it("typeAheadValues$", () => {
    const data: any = {cancerList: [{name: "some name"}]};
    service.typeAheadValues$("Loo", "https://some.url.com").subscribe(res => {
      expect(res[0].name).toEqual(data.cancerList[0].name);
    });
    mockBackend.expectOne(() => true).flush(data);
    mockBackend.verify();

    data.cancerList = false;
    service.typeAheadValues$("Loo", "https://some.url.com").subscribe(res => {
      expect(res).toEqual(data);
    });
    mockBackend.expectOne(() => true).flush(data);
  });
});
