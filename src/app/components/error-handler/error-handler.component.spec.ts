import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ErrorHandlerModalComponent } from "./error-handler.component";

describe("ErrorHandlerModalComponent", () => {
  let component: ErrorHandlerModalComponent;
  let fixture: ComponentFixture<ErrorHandlerModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrorHandlerModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorHandlerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });
});
