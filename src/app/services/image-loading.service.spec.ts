import {TestBed, inject, async} from "@angular/core/testing";

import {ImageLoadingService} from "./image-loading.service";
import {BaseRequestOptions, ConnectionBackend, Http, ResponseOptions, Response} from "@angular/http";
import {MockBackend} from "@angular/http/testing";
import {Subscription} from "rxjs";
import {HttpClient} from "@angular/common/http";
// import {Token} from "@angular/compiler/src/ml_parser/lexer";

function mockSuccess(backend: MockBackend, data?: any): Subscription {
  return backend.connections.subscribe(c => {
    const response = new ResponseOptions({body: data || {success: true}});
    c.mockRespond(new Response(response));
  });
}

function mockError(backend: MockBackend, error?: any): Subscription {
  return backend.connections.subscribe(c => {
    const response = new ResponseOptions({body: error || {status: 400}});
    c.mockError(new Response(response));
  });
}

function failOnData() {
  return fail("Data should not have been returned");
}

describe("ImageLoadingService", () => {
  let service: ImageLoadingService;
  let mockBackend: MockBackend;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ImageLoadingService,
        MockBackend,
        BaseRequestOptions,
        {
          provide: HttpClient,
          useFactory: (backend: ConnectionBackend, defaultOptions: BaseRequestOptions) => new Http(backend, defaultOptions),
          deps: [MockBackend, BaseRequestOptions]
        }
      ]
    });
  });
  beforeEach(async(() => {
    mockBackend = TestBed.get(MockBackend);
    service = TestBed.get(ImageLoadingService);
  }));

  it("should create", () => {
    expect(service).toBeTruthy();
  });

  it("preloadBodyImages", () => {
    const response = "img";
    const backendSub = mockSuccess(mockBackend, response);
    let result: any;

    service.preloadBodyImages().subscribe(res => result = res);
    expect(result).toBeTruthy();
    backendSub.unsubscribe();
  });
});
