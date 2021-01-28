import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ModalComponent } from "./modal.component";
import { ModalService } from "./modal.service";
import {TestModalContentComponent} from "../../../test/components-stubs/test-modal-content.component.stub.spec";
import {ModalServiceStub} from "../../../test/services-stubs/modal.service.stub";

describe("ModalComponent", () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;
  let contentComponentFixture: ComponentFixture<TestModalContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ModalComponent,
        TestModalContentComponent
      ],
      providers: [
        {provide: ModalService, useClass: ModalServiceStub}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    contentComponentFixture = TestBed.createComponent(TestModalContentComponent);
    component["content"] = contentComponentFixture.componentRef;
    fixture.detectChanges();
  });

  xit("should be created", () => {
    expect(component).toBeTruthy();
  });
});
