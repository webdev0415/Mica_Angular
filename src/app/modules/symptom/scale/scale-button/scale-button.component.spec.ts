import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ScaleButtonComponent } from "./scale-button.component";
import { TitleCasePipe } from "../../../pipes/title-case.pipe";

describe("ScaleButtonComponent", () => {
  let component: ScaleButtonComponent;
  let fixture: ComponentFixture<ScaleButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ScaleButtonComponent,
        TitleCasePipe
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("getter btnClass: isSelected flag", () => {
    component.isSelected = true;
    expect(component.btnClass).toEqual("btn-success");
  });

  it("getter btnClass: isAvailable flag is false", () => {
    component.isAvailable = false;
    expect(component.btnClass).toEqual("btn-secondary");
  });

  it("getter btnClass: isInvalid flag", () => {
    component.isInvalid = true;
    expect(component.btnClass).toEqual("btn-warning");
  });

  it("getter btnClass: by default", () => {
    expect(component.btnClass).toEqual("btn-primary");
  });

  it("onClick", () => {
    const toggleSpy = spyOn(component.toggleRange, "next");

    component.onClick();
    expect(toggleSpy).toHaveBeenCalled();
  });

  it("Name is Less Than 1 Day", () => {
    expect(component.transformRangeName("Less than 1 Day")).toContain("< 1 Day");
  });

  it("Name is Less than 1 Week", () => {
    expect(component.transformRangeName("Less than 1 Week")).toContain("< 1 Week");
  });

  it("Name is Less than 1 Month", () => {
    expect(component.transformRangeName("Less than 1 Month")).toContain("< 1 Month");
  });

});
