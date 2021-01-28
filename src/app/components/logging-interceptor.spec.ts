import { LoggingInterceptor } from "./logging-interceptor";
import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { HTTP_INTERCEPTORS, HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { of, throwError } from "rxjs";

describe("LoggingInterceptor", () => {

  let interceptor: LoggingInterceptor;
  let mockBackend: HttpTestingController;

  const err: any = new HttpErrorResponse({ error: "Testing Error" });
  const req: any = { method: "GET" };
  const resp: any = new HttpResponse({});

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        { provide: HTTP_INTERCEPTORS, useValue: LoggingInterceptor, multi: true },
      ]
    });
    mockBackend = TestBed.get(HttpTestingController);
    interceptor = new LoggingInterceptor();
  });

  it("should create an instance", () => {
    expect(new LoggingInterceptor()).toBeTruthy();
    expect(interceptor.color).toBe("green");
  });

  it("logLocal receives error", () => {
    interceptor["currentRequest"] = req;
    expect(interceptor.logLocal(undefined, err)).toBeUndefined();
    expect(interceptor.color).toEqual("red");
  });

  it("logLocal receives event", () => {
    interceptor["currentRequest"] = req;
    expect(interceptor.logLocal(resp)).toBeUndefined();
    expect(interceptor.color).toEqual("green");
  });

  it("intercept", fakeAsync(() => {
    const handler = { handle: () => {} };
    const handleSpy = spyOn(handler, "handle");
    const logLocalSpy = spyOn(interceptor, "logLocal").and.callFake(() => {});

    handleSpy.and.returnValue(of(resp));
    interceptor.intercept(req, <any>handler).subscribe();
    tick();
    expect(handleSpy).toHaveBeenCalledWith(req);
    expect(logLocalSpy).toHaveBeenCalledWith(resp);

    handleSpy.and.returnValue(throwError(err));
    expect(() => {
      interceptor.intercept(req, <any>handler).subscribe();
      tick();
    }).toThrow();
    expect(handleSpy).toHaveBeenCalledWith(req);
    expect(logLocalSpy).toHaveBeenCalledWith(undefined, err);
  }));
});
