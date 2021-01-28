import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { DescriptorToggleComponent } from "./descriptor-toggle.component";
import {NgRedux} from "@angular-redux/store";
import {environment} from "../../../../environments/environment";

describe("DescriptorToggleComponent", () => {
  let component: DescriptorToggleComponent;
  let fixture: ComponentFixture<DescriptorToggleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DescriptorToggleComponent ],
      providers: [
        NgRedux
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DescriptorToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(environment, "production").and.returnValue(true);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should toggle descriptor", () => {
    const toggleSpy = spyOn(component.toggleDescriptor, "emit").and.callThrough();
    component.onToggleDescriptor();
    expect(toggleSpy).toHaveBeenCalledWith(true);
  });

  it("descriptorBackground", () => {
    component.hasBodySelector = true;
    expect(component.descriptorBackground).toEqual("url(/MICA/assets/img/descriptors/external-front.png)");
  });
});
