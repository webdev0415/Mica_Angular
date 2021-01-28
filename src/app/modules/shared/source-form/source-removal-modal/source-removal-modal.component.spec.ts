import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { SourceRemovalModalComponent } from "./source-removal-modal.component";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import {PipesModule} from "../../../pipes/pipes.module";

describe("SourceRemovalModalComponent", () => {
  let component: SourceRemovalModalComponent;
  let fixture: ComponentFixture<SourceRemovalModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        PipesModule
      ],
      declarations: [ SourceRemovalModalComponent ],
      providers: [
        NgbActiveModal
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceRemovalModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("removeFromRecord", () => {
    (<any>component).activeModal = { close: () => {} };

    const closeSpy = spyOn((<any>component).activeModal, "close").and.callThrough();

    component.removeFromRecord("illness");
    expect(closeSpy).toHaveBeenCalledWith("illness");
  });

  it("removeFromTreatment", () => {
    (<any>component).activeModal = { close: () => {} };
    component.treatmentType = "drug";

    const closeSpy = spyOn((<any>component).activeModal, "close").and.callThrough();

    component.removeFromTreatment(true);
    expect(closeSpy).toHaveBeenCalledWith("treatment");

    component.removeFromTreatment();
    expect(closeSpy).toHaveBeenCalledWith("drug");
  });

  it("cancel", () => {
    const dismissSpy = spyOn((<any>component).activeModal, "dismiss").and.callFake(() => {});

    component.cancel();
    expect(dismissSpy).toHaveBeenCalled();
  });
});
