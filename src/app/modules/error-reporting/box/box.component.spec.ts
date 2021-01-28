import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ErrorBoxComponent } from "./box.component";

describe("ErrorBoxComponent", () => {
  let component: ErrorBoxComponent;
  let fixture: ComponentFixture<ErrorBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrorBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("shoulr form error message", () => {
    component.message = 'message123';
    expect(component.emailBody).toContain(component.message);
  })
});
