import {TestBed, inject, async} from "@angular/core/testing";
import {CountryService} from "./country.service";
import {BaseRequestOptions, ConnectionBackend, Http} from "@angular/http";
import {MockBackend} from "@angular/http/testing";
import {HttpClient} from "@angular/common/http";

describe("CountryService", () => {
  let service: CountryService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CountryService,
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
    service = TestBed.get(CountryService);
  }));

  it("should create", () => {
    expect(service).toBeTruthy();
  });

  it("countries$", () => {
    expect(service.countries$).toBeDefined();
  });
});
