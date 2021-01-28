/**
 * Created by sergeyyudintsev on 05.09.17.
 */
import {
  inject,
  async,
  TestBed
} from "@angular/core/testing";
import { MockBackend } from "@angular/http/testing";
import {
  Http,
  ConnectionBackend,
  BaseRequestOptions,
} from "@angular/http";
import { authConfig, AUTH_CONFIG } from "../../app.config";
import { ModalService } from "./modal.service";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { BrowserModule } from "@angular/platform-browser";
import { TestModalContentComponent } from "../../../test/components-stubs/test-modal-content.component.stub.spec";
import { TestAppComponent } from "../../../test/components-stubs/test-app.component.stub.spec";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ModalComponent } from "./modal.component";

describe("TaskService", () => {
  let backend: MockBackend;
  let svc: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ModalComponent,
        TestModalContentComponent,
        TestAppComponent
      ],
      imports: [BrowserModule],
      providers: [
        BaseRequestOptions,
        MockBackend,
        ModalService,
        NgbActiveModal,
        {provide: AUTH_CONFIG, useValue: authConfig},
        {
          provide: Http,
          useFactory: (backend: ConnectionBackend, defaultOptions: BaseRequestOptions) => new Http(backend, defaultOptions),
          deps: [MockBackend, BaseRequestOptions]
        }
      ]
    });
    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [
          ModalComponent,
          TestModalContentComponent
        ],
        bootstrap: [TestAppComponent]
      },
    });

    backend = TestBed.get(MockBackend);
    svc = TestBed.get(ModalService);
  });

  it("should create", inject([ModalService], (service: ModalService) => {
    expect(service).toBeTruthy();
  }));

  it("should create component", () => {
    const componentRef = svc["createComponent"](ModalComponent);
    expect(componentRef).toBeTruthy();
  });

  it("should create component node", () => {
    const componentRef = svc["createComponent"](ModalComponent);
    const componentNode = svc["getComponentNode"](componentRef);
    expect(componentNode).toBeTruthy();
  });

  it("should open and close modal", async(() => {
    const componentRef = svc["createComponent"](TestAppComponent);
    const modalRef = svc["createComponent"](ModalComponent);
    const node = svc["getComponentNode"](componentRef);
    const modalNode = svc["getComponentNode"](modalRef);
    const getComponentNodeSpy = spyOn(svc as any, "getComponentNode").and.returnValues(node, modalNode);
    const contentRef = svc.open(TestModalContentComponent);
    const close = spyOn(contentRef.instance, "closeModal").and.callThrough();

    expect(contentRef).toBeTruthy();
    contentRef.instance.closeModal(1);
    expect(close).toHaveBeenCalled();
    expect(getComponentNodeSpy).toHaveBeenCalled();
  }));

  it("should destroy modal", async(() => {
    const componentRef = svc["createComponent"](TestAppComponent);
    const modalRef = svc["createComponent"](ModalComponent);
    const node = svc["getComponentNode"](componentRef);
    const modalNode = svc["getComponentNode"](modalRef);
    const getComponentNodeSpy = spyOn(svc as any, "getComponentNode").and.returnValues(node, modalNode);
    const createComponent = spyOn(svc as any, "createComponent").and.callThrough();
    const contentRef = svc.open(TestModalContentComponent);
    const trueModalRef = createComponent.calls.first().returnValue;
    let result = false;

    expect(contentRef).toBeTruthy();
    contentRef.instance.onModalClose.subscribe(() => result = true);
    trueModalRef.destroy();
    expect(result).toBeTruthy();
    expect(getComponentNodeSpy).toHaveBeenCalled();
  }));

});
