import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { WorkbenchPhysicalLayoutComponent } from "./layout.component";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { defaultState } from "app/app.config";
import { NgRedux, NgReduxModule } from "@angular-redux/store";
import { NgReduxTestingModule } from "@angular-redux/store/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { testRoutes } from "../../../../../../../test/data/test-routes";
import { TestComponent } from "../../../../../../../test/test.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import * as symptomsSelectors from "app/state/symptoms/symptoms.selectors";

@Component({
  selector: "mica-body-selector",
  template: "<div></div>"
})
class MockBodySelector {
  @Input() defaultZone: string;
  @Input() selectedBodyParts: string[];
  @Input() svgShapes: MICA.BodyImage.ViewSVGMap;
}

@Component({
  selector: "workbench-body-part-selector",
  template: "<div></div>"
})
class MockBodyPartSelector {
  @Input() bodyPartsAll: string[];
}

@Component({
  selector: "workbench-symptoms-list",
  template: "<div></div>"
})
class MockSymptomsList {
  @Input() categoryID: string;
  @Input() bodyView: string;
  @Input() bodyParts: string[] = [];
  @Input() bodyPartsAll: string[] = [];
}

const mockRedux = {
  getState: (): State.Root => {
    return defaultState
  },
  dispatch: (arg: any) => {}
};

describe("WorkbenchPhysicalLayoutComponent", () => {
  let component: WorkbenchPhysicalLayoutComponent;
  let fixture: ComponentFixture<WorkbenchPhysicalLayoutComponent>;
  let redux: NgRedux<State.Root>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        WorkbenchPhysicalLayoutComponent,
        MockBodySelector,
        MockBodyPartSelector,
        MockSymptomsList,
        TestComponent
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        { provide: NgReduxModule, useClass: NgReduxTestingModule}
      ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        RouterTestingModule.withRoutes(testRoutes)
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkbenchPhysicalLayoutComponent);
    redux  = TestBed.get(NgRedux);
    component = fixture.componentInstance;
    component.bodySelectedPath = ["1", "2", "3", ["1", "2", "3"]];
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("activeView", () => {
    component.bodySelectedPath = ["17", "17", "17", ["17"]];
    expect(component.activeView).toEqual("17");
  });

  it("hasMultiPartSelection", () => {
    component.bodyPartsAll = ["part_one", "part_two"];
    expect(component.hasMultiPartSelection).toBeTruthy();
  });

  it("onBodyPartSelect", () => {
    const output = {
      selectedPath: component.bodySelectedPath,
      bodyParts: []
    };
    expect(component.onBodyPartSelect(output)).toBeUndefined();
  });

  it("onBodyPartSelect", () => {
    const output = {
      selectedPath: component.bodySelectedPath,
      bodyParts: ["17"]
    };
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    component.onBodyPartSelect(output);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("categoryState", () => {
    component["animateCategory"] = true;
    expect(component.categoryState).toEqual("animated");
  });

  it("noBodyPartMatch", () => {
    spyOnProperty<any>(component, "activeCategoryID", "get").and.returnValue("17");
    expect(component.noBodyPartMatch).toEqual("");
  });

  it("onBodyPartSelect", () => {
    const s = {...defaultState};
    const group = "group";
    const name = "name";
    Object.assign(s, {
      nav: {
        activeGroup: group
      },
      symptoms: {
        entities: {
          symptomGroups: {
            "group": {
              categories: [1]
            },
          },
          categories: {
            "1": {
              name: name,
              categoryId: 1
            }
          }
        }
      }
    });
    component.bodySelectedPath = [] as any;
    const input = {
      selectedPath: ["", "", name],
      bodyParts: []
    };
    spyOnProperty(component, "state", "get").and.returnValue(s);
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();
    component.onBodyPartSelect(input as any);
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it("onBodyPartSelect", () => {
    const s = {...defaultState};
    const group = "group";
    const name = "name";
    Object.assign(s, {
      nav: {
        activeGroup: group
      },
      symptoms: {
        entities: {
          symptomGroups: {
            "group": {
              categories: [1]
            },
          },
          categories: {
            "1": {
              name: name,
              categoryId: 1
            }
          }
        }
      }
    });
    component.bodySelectedPath = [] as any;
    const input = {
      selectedPath: ["", "", name],
      bodyParts: []
    };
    spyOnProperty(component, "state", "get").and.returnValue(s);
    spyOn(symptomsSelectors, "catIDFromName").and.returnValue(() => {throw Error("")});
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();
    component.onBodyPartSelect(input as any);
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it("onBodyPartSelect", () => {
    component.bodySelectedPath = [] as any;
    const input = {
      selectedPath: null,
      bodyParts: []
    };
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();
    component.onBodyPartSelect(input as any);
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it("setDefaultBodyPart", () => {
    const bodyPart = "part";
    component.defaultBodyPart = "";
    component["setDefaultBodyPart"](bodyPart);
    expect(component.defaultBodyPart).toEqual(bodyPart);
  });

  it("noBodyPartMatch", () => {
    spyOnProperty<any>(component, "activeCategoryID", "get").and.returnValue("");
    component.bodySelectedPath = null;
    expect(component.noBodyPartMatch).toEqual("");
  });
});
