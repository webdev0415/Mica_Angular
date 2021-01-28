import { ErrorHandlerModalComponent } from "./error-handler.component";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { TestBed, inject } from "@angular/core/testing";
import { MICAErrorHandlerService } from "./error-handler.service";
import { ModalService } from "../modal/modal.service";
import { ModalServiceStub } from "../../../test/services-stubs/modal.service.stub";
import { TestAppComponent } from "../../../test/components-stubs";

describe("MICAErrorHandlerService", () => {
  let svc: MICAErrorHandlerService;
  let modalSvc: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestAppComponent,
        ErrorHandlerModalComponent
      ],
      providers: [
        MICAErrorHandlerService,
        {provide: ModalService, useClass: ModalServiceStub}
      ]
    });
    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [
          ErrorHandlerModalComponent
        ],
        bootstrap: [TestAppComponent]
      },
    });
    svc = TestBed.get(MICAErrorHandlerService);
    modalSvc = TestBed.get(ModalService);
  });

  it("should be created", inject([MICAErrorHandlerService], (service: MICAErrorHandlerService) => {
    expect(service).toBeTruthy();
    expect(service.isModalshow).toBe(false);
  }));

  it("should handle errors which follow MITA Error Response schema", () => {
    const errorStub = {
      json() {
        return {
          message: "An error",
          reason: "A reson",
          statusCode: 500
        };
      }
    };
    svc.isModalshow = false
    const modalOpen = spyOn(modalSvc, "open").and.callThrough();
    const consoleSpy = spyOn(console, "error");
    svc.handleError(errorStub);
    expect(consoleSpy).toHaveBeenCalled();
    expect(modalOpen).toHaveBeenCalled();
    const ref = modalSvc.open(ErrorHandlerModalComponent);
    expect(svc.isModalshow).toBe(true);
    expect(ref.instance.closeModal()).toBeUndefined();
    expect(svc.isModalshow).toBe(false);
  });

  it("should be able to handle errors which don't follow MITA Error Response schema", () => {
    const modalOpen = spyOn(modalSvc, "open").and.callThrough();
    const consoleSpy = spyOn(console, "error");
    svc.handleError(new Error("test"));
    expect(consoleSpy).toHaveBeenCalled();
    expect(modalOpen).toHaveBeenCalled();
  });

  it("should not be able to handle errors", () => {
    const modalOpen = spyOn(modalSvc, "open").and.callThrough();
    const consoleSpy = spyOn(console, "error");
    svc.isModalshow = true;
    svc.handleError(new Error("test"));
    expect(consoleSpy).not.toHaveBeenCalled();
    expect(modalOpen).not.toHaveBeenCalled();
  });

  it("should be able to handle errors which don't follow MITA Error Response schema", () => {
    const modalOpen = spyOn(modalSvc, "open").and.callThrough();
    const consoleSpy = spyOn(console, "error");
    svc.handleError(new Error(""));
    expect(consoleSpy).toHaveBeenCalled();
    expect(modalOpen).toHaveBeenCalled();
  });
});
