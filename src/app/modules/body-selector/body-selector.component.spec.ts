import { ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import * as _ from "lodash";
import { BodySelectorComponent } from "./body-selector.component";
import { TitleCasePipe } from "../pipes/title-case.pipe";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";

const svgShapesPhysical  = require("../../../test/data/svgShapesPhysical.json");

describe("BodySelectorComponent", () => {
  let component: BodySelectorComponent;
  let fixture: ComponentFixture<BodySelectorComponent>;
  let mockBackend: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        BodySelectorComponent,
        TitleCasePipe
      ],
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        HttpClientTestingModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    router = TestBed.get(Router);
    fixture = TestBed.createComponent(BodySelectorComponent);
    component = fixture.componentInstance;
    component.svgShapes = svgShapesPhysical;
    mockBackend = TestBed.get(HttpTestingController);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("perspectiveActiveName getter", () => {
    expect((component as any).perspectiveActiveName).toEqual(component.selectedPath[1]);
  });

  it("onPerspectiveChange", () => {
    const name = "name";
    spyOn((component as any), "resetZoom").and.callFake(() => {});
    (component as any).onPerspectiveChange(name);
    expect((component as any).perspectiveActiveName).toEqual(name);
  });

  it("onBodyViewChange", () => {
    const view = "view";
    spyOn((component as any), "resetZoom").and.callFake(() => {});
    (component as any).onBodyViewChange(view);
    expect(component.selectedPath[0]).toEqual(view);
  });

  it("findPath", () => {
    let group = _.find(svgShapesPhysical.general.front.Head, group => !!group.groupName);
    let shapes = _.map(group.shapes, "name");
    let res = ["general", "front", group.groupName, shapes];
    expect((component as any).findPath(shapes[0])).toEqual(res);
    expect((component as any).findPath(group.groupName)).toEqual(res);

    group = _.find(svgShapesPhysical.general.front.Head, group => !group.groupName);
    res = ["general", "front"];
    shapes = _.map(group.shapes, shape => {
      res.push(shape.name, [shape.name]);
      return shape.name
    });
    expect((component as any).findPath(shapes[0])).toEqual(res);
  });

  it("findZone", () => {
    const group = _.find(svgShapesPhysical.general.front.Head, group => !!group.groupName);
    let result;
    result = (component as any).findZone(group.groupName);
    expect(result).toEqual(group);
    result = (component as any).findZone("someName");
    expect(result).toBeUndefined();
  });

  it("onBodyPartClicked", () => {
    const group = _.find(svgShapesPhysical.general.front.Head, group => !!group.groupName);
    let res;
    spyOn((component as any), "resetZoom").and.callFake(() => {});
    res = (component as any).onBodyPartClicked("Whole Body");
    expect(res).toBeUndefined();
    (component as any).onBodyPartClicked(group.groupName);
    expect(res).toBeUndefined();
  });

  it("canResetZoom", () => {
    component.selectedPath = ["", "", "name", []];
    component.showMappings = true;
    expect(component.canResetZoom).toBeTruthy();
  });

  it("zoneSvgMappings", () => {
    component.selectedPath = ["", "side", "", []];
    component["zoomedOnPart"] = "Chest";
    expect(component.zoneSvgMappings).toBeUndefined();
  });

  it("zoneSvgMappings", () => {
    component.selectedPath = ["", "notside", "", []];
    component["zoomedOnPart"] = "Chest";
    expect(component.zoneSvgMappings).toBeUndefined();
  });

  it("adjustView", () => {
    const bodyPartClickedSpy = spyOn(component, "onBodyPartClicked").and.callThrough();
    const viewName = "name";
    const bodyPart = "bodypart";

    component.defaultZone = "default zone";
    component["onPerspectiveChange"] = () => {};
    component["adjustView"]({ viewName, bodyPart });
    expect(component.selectedPath[0]).toEqual(viewName);
    expect(bodyPartClickedSpy).toHaveBeenCalledWith(bodyPart);
  });

  it("adjustView", () => {
    const bodyPartClickedSpy = spyOn(component, "onBodyPartClicked").and.callThrough();
    const viewName = "name";
    const bodyPart = "";

    spyOn<any>(component, "findPath").and.returnValue([1, 2, 3, [4]]);
    component.defaultZone = "default zone";
    component["onPerspectiveChange"] = () => {};
    component["adjustView"]({ viewName, bodyPart });
    expect(component.selectedPath[0]).toEqual(viewName);
    expect(bodyPartClickedSpy).toHaveBeenCalledWith(4);
  });

  it("adjustView", () => {
    const bodyPartClickedSpy = spyOn(component, "onBodyPartClicked").and.callThrough();
    const viewName = "name";
    const bodyPart = "";

    spyOn<any>(component, "findPath").and.returnValue([1, 2, 3, null]);
    component.defaultZone = "default zone";
    component["onPerspectiveChange"] = () => {};
    component["adjustView"]({ viewName, bodyPart });
    expect(component.selectedPath[0]).toEqual(viewName);
    expect(bodyPartClickedSpy).toHaveBeenCalledWith(3);
  });

  it("zoneSvgMappings", () => {
    component["zoomedOnPart"] = "";
    expect(component.zoneSvgMappings).toBeDefined();
  });

  it("shapeSelectedClass", () => {
    component.selectionBehaviour = "pick";
    expect(component["shapeSelectedClass"](null, null)).toEqual("hoverable");
  });

  it("shapeSelectedClass", () => {
    const shapeName = "shape name";
    component["selectedShapes"] = [shapeName];
    expect(component["shapeSelectedClass"](shapeName, null)).toEqual("selected");
  });

  it("shapeSelectedClass", () => {
    const shapeName = "shapeName";
    const zone = {shapes: [{name: shapeName}]};
    component["selectedShapes"] = [shapeName];
    expect(component["shapeSelectedClass"]("", zone)).toEqual("");
  });

  it("shapeSelectedClass", () => {
    const zone = {shapes: [{name: "name"}]};
    component["selectedShapes"] = ["shapeName"];
    expect(component["shapeSelectedClass"]("", zone)).toEqual("hoverable");
  });

  it("onBodyViewChange", () => {
    component["onBodyViewChange"]("Whole Body");
    expect(component.selectedPath[0]).toEqual("general");
    expect((component.selectedPath as any)[4]).toEqual("true");
  });

  it("onBodyPartClicked", () => {
    const groupName = "groupname";
    component.selectedPath[2] = groupName;
    expect(component.onBodyPartClicked("val", {groupName: groupName})).toBeUndefined();
  });

  it("onBodyPartClicked", () => {
    const groupName = "groupname";
    component.selectedPath[2] = groupName;
    component.selectedPath[3] = [groupName];
    expect(component.onBodyPartClicked(groupName, {groupName: groupName})).toBeUndefined();
  });

  it("perspectiveAnimationState", () => {
    const name = "name";
    component["perspectiveNames"] = ["", "", name];
    expect(component["perspectiveAnimationState"](name)).toEqual("right");
  });

  it("perspectiveAnimationState", () => {
    const name = "name";
    component["perspectiveNames"] = ["", "", ""];
    expect(() => component["perspectiveAnimationState"](name)).toThrow();
  });

  it("onBodyPartClicked", () => {
    spyOn<any>(component, "resetZoom").and.returnValue(false);
    spyOn<any>(component, "setSelectedShapes").and.callFake(() => {});
    component["selectedShapes"] = [];
    expect(component["onBodyPartClicked"]("", {})).toBeFalsy();
  });

  it("setSelectedShapes", () => {
    const value = "value";
    spyOn<any>(component, "isMultipart").and.returnValue(true);
    component["selectedShapes"] = [value];
    component["setSelectedShapes"]([] as any, {}, value);
    expect(component["selectedShapes"].length).toEqual(0)
  });

  it("checkLastZone", () => {
    const zone = {
      isLast: false
    };
    component["selectedShapes"] = ["shape"];
    const value = "value";
    component["zoomedOnPart"] = "part";
    component["checkLastZone"](zone, value);
    expect(component["zoomedOnPart"]).toEqual("shape");
  });

  it("setZoomedPart", () => {
    component["zoomedOnPart"] = "left leg";
    spyOn<any>(component, "isMultipart").and.returnValue(true);
    const zone = {
      shapes: [{}, {}]
    } as MICA.BodyImage.SVGGroup;
    component["selectedShapes"] = ["right arm"];
    component.selectionBehaviour = "select";
    component["setZoomedPart"](zone);
    expect(component["zoomedOnPart"]).toEqual("Right leg");
  });

  it("setZoomedPart", () => {
    const zone = {
      shapes: [{}, {}]
    } as MICA.BodyImage.SVGGroup;

    spyOn<any>(component, "isMultipart").and.returnValue(true);
    component["zoomedOnPart"] = "right leg";
    component["selectedShapes"] = ["left arm"];
    component.selectionBehaviour = "select";
    component["setZoomedPart"](zone);
    expect(component["zoomedOnPart"]).toEqual("Left leg");
  });

  it("setZoomedPart", () => {
    const zone = {
      shapes: [{}, {}]
    } as MICA.BodyImage.SVGGroup;

    spyOn<any>(component, "isMultipart").and.returnValue(true);
    component["zoomedOnPart"] = "left leg";
    component["selectedShapes"] = ["left arm"];
    component.selectionBehaviour = "select";
    component["setZoomedPart"](zone);
    expect(component["zoomedOnPart"]).toEqual("left leg");
  });

  it("getSelectedPath", () => {
    const path = ["", "", "", [""]] as MICA.BodyImage.SelectedPath;
    spyOn<any>(component, "getZoneShapeNames").and.returnValue([""]);
    const zone = {
      groupName: null
    };
    const value = "value";
    expect(component["getSelectedPath"](path, zone, value)[2]).toEqual(value);
  });

  it("getSelectedPath", () => {
    const groupName = "groupName";
    const path = ["", "", groupName, []] as MICA.BodyImage.SelectedPath;
    const zone = {
      groupName: groupName
    };
    const value = "value";
    expect(component["getSelectedPath"](path, zone, value)[2]).toEqual(groupName);
  });

  it("findZone", () => {
    const name = "name";
    component.svgShapes = {
      groupName: "",
      shapes: [
        {
          name: name
        }
      ]
    } as any;
    expect(component["findZone"](name)).toBeUndefined();
  });

  it("triggerZoom", () => {
    spyOn<any>(component, "getParentGroupData").and.returnValue({
      shapeName: "",
      changeValue: true
    });
    const checkLastZoneSpy = spyOn<any>(component, "checkLastZone").and.callThrough();
    component["triggerZoom"](null, {shapes: [{}]}, "", <any>[]);
    expect(checkLastZoneSpy).toHaveBeenCalled();
  });

  it("triggerZoom", () => {
    component["triggerZoom"](null, {}, "", <any>[]);
  });

  it("getParentGroupData", () => {
    const svgShapes = {
      type: {
        side: {
          "Whole Body": [
            {
              groupName: "groupName",
              shapes: [
                {
                  name: "groupName"
                }
              ]
            }
          ]
        }
      }
    };
    component.svgShapes = svgShapes;
    component["getParentGroupData"]("groupName", "type", "side");
  });

  it("getParentGroupData", () => {
    spyOn<any>(component, "findParentGroupData").and.returnValues(null, {});
    expect(component["getParentGroupData"]("groupName", "type", "side")).toEqual({} as any);
  });

  it("getParentGroupData", () => {
    spyOn<any>(component, "findParentGroupData").and.returnValues(null, null);
    component["perspectiveNames"] = [];
    expect(component["getParentGroupData"]("groupName", "type", "side")).toBeDefined();
  });

  it("onBodyPartClicked", () => {
    spyOn<any>(component, "findParentGroupData").and.returnValue(null);
    component.onBodyPartClicked("Head", null);
  });

  it("findParentGroupData", () => {
    component.svgShapes = {
      type: {
        side: {}
      }
    };
    expect(component["findParentGroupData"]("side", "type", "groupName")).toBeNull();
  });

  it("findParentGroupData", () => {
    component.svgShapes = {
      type: {
        side: {
          "Whole Body": [
            {
              groupName: "groupName"
            }
          ]
        }
      }
    } as any;
    expect(component["findParentGroupData"]("side", "type", "groupNameOther")).toBeNull();
  });

  it("detectChanges", () => {
    component["cd"] = {
      detectChanges: () => {}
    } as ChangeDetectorRef;
    const detectChangesSpy = spyOn<any>(component["cd"], "detectChanges").and.callThrough();
    component["detectChanges"]();
    expect(detectChangesSpy).toHaveBeenCalled();
  });

  it("should change view on navigation end", fakeAsync(() => {
    const adjustViewSpy = spyOn(<any>component, "adjustView").and.callFake(() => {});
    const queryParams = { paramOne: "value" };

    router.navigate([""], { queryParams });
    tick();
    expect(adjustViewSpy).toHaveBeenCalledWith(queryParams);
  }));

});
