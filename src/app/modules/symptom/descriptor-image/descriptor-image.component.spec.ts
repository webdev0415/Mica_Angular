import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { DescriptorImageComponent } from "./descriptor-image.component";
import {BodySelectorComponent} from "../../body-selector/body-selector.component";
import {TitleCasePipe} from "../../pipes/title-case.pipe";
import {NgRedux} from "@angular-redux/store";
import {DataServiceStub} from "../../../../test/services-stubs/data.service.stub";
import {DataService} from "../services/data.service";
import Output = MICA.BodyImage.Output;
import {of} from "rxjs/observable/of";
import {defaultState} from "../../../app.config";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
const mockRedux = {
  getState: (): State.Root => {
    return {...defaultState}
  },
  dispatch: (arg: any) => {}
};

describe("DescriptorImageComponent", () => {
  let component: DescriptorImageComponent;
  let fixture: ComponentFixture<DescriptorImageComponent>;
  let mockBackend: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DescriptorImageComponent,
        BodySelectorComponent,
        TitleCasePipe
      ],
      providers: [
        { provide: DataService, useClass: DataServiceStub },
        { provide: NgRedux, useValue: mockRedux }
      ],
      imports: [
        HttpClientTestingModule
      ]
    })
    .compileComponents();
    mockBackend = TestBed.get(HttpTestingController);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DescriptorImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("onBodyPartSelect", () => {
    const selectSpy = spyOn(component.select, "emit").and.callThrough();
    component["onBodyPartSelect"]({selectedPath: ["1", "2", "3", ["1"]]} as Output);
    expect(selectSpy).toHaveBeenCalledWith("3");
  });

  it("onBodyPartSelect", () => {
    const selectSpy = spyOn(component.select, "emit").and.callThrough();
    expect(component["onBodyPartSelect"]({selectedPath: ["1", "2", "", ["1"]]} as Output)).toBeUndefined();
    expect(selectSpy).not.toHaveBeenCalled();
  });

  it("descriptorBackground", () => {
    const res = "/assets/img/descriptors/external-front.png";
    component.hasBodySelector = true;
    expect(component.descriptorBackground).toEqual(res);
  });

  it("descriptorBackground", () => {
    const res = "/assets/img/descriptors/file.png";
    component.hasBodySelector = false;
    component.descriptorFile = "file.png";
    expect(component.descriptorBackground).toEqual(res);
  });

  it("state", () => {
    expect(component["state"]).toBeDefined();
  });

  it("ngOnDestroy", () => {
    const sub = of({}).subscribe();
    const unsubscribeSpy = spyOn(sub, "unsubscribe").and.callThrough();
    component["subs"].push(sub);
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it("onCloseDescriptor", () => {
    const emitSpy = spyOn(component.close, "emit").and.callThrough();
    component.onCloseDescriptor();
    expect(emitSpy).toHaveBeenCalled();
  });

  it("valueText", () => {
    component.value = "value,value";
    expect(component.valueText.indexOf(", ")).not.toEqual(-1);
  });

  it("valueText", () => {
    component.value = "";
    expect(component.valueText).toEqual("");
  });

  it("setSvgShapes", () => {
    const active = true;
    const svgShapes = {} as MICA.BodyImage.ViewSVGMap;
    component["setSvgShapes"](active, svgShapes).subscribe(value => {
      expect(value).toEqual(active);
    });
  });

  it("loadPainSvgShapes", () => {
    const active = true;
    const svgShapes = {} as MICA.BodyImage.ViewSVGMap;
    component.svgShapes = svgShapes;
    component["loadPainSvgShapes"](active).subscribe(value => {
      expect(value).toEqual(active);
    });
  });
});
