import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { Component, Input } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import * as _ from "lodash";

import { SymptomReviewNewComponent } from "./symptom-review-new.component";
import { TitleCasePipe } from "../../../pipes/title-case.pipe";
import { BadgeIconComponent } from "../../../gui-widgets/components/badge-icon/badge-icon.component";
import { NgRedux } from "@angular-redux/store";
import { defaultState } from "../../../../app.config";
import { Router } from "@angular/router";
import * as symptomsSelectors from "../../../../state/symptoms/symptoms.selectors";
import { of } from "rxjs/observable/of";
import { SvgShapesService } from "app/services/svgShapes.service";

const shapes = require("assets/mappings/svgShapesPhysical.json");
const fakeSymptoms = require("../../../../../test/data/symptoms.json");
const state = _.cloneDeep(defaultState);

const mockRedux = {
  getState: (): State.Root => {
    return state
  },
  select: (selector) => of(selector(state)),
  dispatch: (arg: any) => {}
};
const mockRouter = {
  navigate: jasmine.createSpy("navigate")
};
const mockSvgShapes = {
  getShapesByGroup: (id: string) => of(null)
};

@Component({
  selector: "mica-symptom",
  template: "<div></div>",
})
export class MockMicaSymptomComponent {
  @Input() readOnly = false;
  @Input() symptomID: string;
  @Input() nlpSymptom: string;
  @Input() bodyParts: string[];
  @Input() bodyPartsAll: string[];
  constructor() { }
}

describe("SymptomReviewNewComponent", () => {
  let component: SymptomReviewNewComponent;
  let fixture: ComponentFixture<SymptomReviewNewComponent>;
  let redux: NgRedux<State.Root>;
  let svgService: SvgShapesService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SymptomReviewNewComponent,
        TitleCasePipe,
        BadgeIconComponent,
        MockMicaSymptomComponent,
      ],
      imports: [BrowserAnimationsModule],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        { provide: Router, useValue: mockRouter },
        { provide: SvgShapesService, useValue: mockSvgShapes }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    redux = TestBed.get(NgRedux);
    svgService = TestBed.get(SvgShapesService);
    fixture = TestBed.createComponent(SymptomReviewNewComponent);
    component = fixture.componentInstance;
    spyOn(symptomsSelectors, "symptomsInCatData").and.returnValue(() => fakeSymptoms);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should trackByGroupName", () => {
    expect(component.trackByGroupName(1, {name: "group"})).toBe("group");
  });

  it("getGroupedSymptoms", () => {
    const sympt =         { bodyParts: ["Ear"], isMissing: false } as Symptom.Value;
    const symptTwo =      { bodyParts: ["Left Ear", "Right Ear"], isMissing: false } as Symptom.Value;
    const symptRequired = { bodyParts: undefined, isMissing: true } as Symptom.Value;
    const symptGeneral =  { bodyParts: undefined, isMissing: false } as Symptom.Value;
    // Physic Symptom
    const groupedPhysic = [
      {name: "Left Ear & Right Ear", symptoms: [ symptTwo ]},
      {name: "Ear", symptoms: [ sympt, sympt ]},
      {name: "Machine Learning Required Symptom", symptoms: [ symptRequired ]},
    ];
    expect(component.getGroupedSymptoms([symptRequired, sympt, symptTwo, sympt])).toEqual(groupedPhysic);
    // General Symptom
    const groupedGeneral = [
      {name: "root", symptoms: [ symptGeneral ]},
      {name: "Machine Learning Required Symptom", symptoms: [ symptRequired ]},
    ];
    expect(component.getGroupedSymptoms([symptRequired, symptGeneral])).toEqual(groupedGeneral);
  });

  it("getBodypart svgShapes", () => {
    component.svgShapes = shapes;
    const symptomDataSpy = spyOn(symptomsSelectors, "symptomDataPath").and.returnValue(() => ({
      categoryName: "Arms",
      viewName: "general"
    }));
    expect(component.getBodypart("id")).toEqual(["Left Arm", "Right Arm"]);
    expect(component.getBodypart("id")).toEqual(["Left Arm", "Right Arm"]);
    expect(symptomDataSpy).toHaveBeenCalledTimes(1);
  });

  it("getBodypart general", () => {
    component.svgShapes = null;
    const symptomDataSpy = spyOn(symptomsSelectors, "symptomDataPath").and.returnValue(() => null);
    expect(component.getBodypart("id")).toEqual([]);
    expect(component.getBodypart("id")).toEqual([]);
    expect(symptomDataSpy).not.toHaveBeenCalled();
  });


  it("findBodyParts Left Arm", () => {
    expect(component.findBodyParts(shapes, "Left Arm")).toEqual(["Left Arm", "Right Arm"]);
  });

  it("findBodyParts Whole Body", () => {
    expect(component.findBodyParts(shapes, "Whole Body")).toEqual(["Whole Body"]);
  });

  it("findBodyParts no shapes", () => {
    // simulate no shapes
    shapes.general.front.Head.unshift({groupName: "group"});
    expect(component.findBodyParts(shapes, "Head")).toBeDefined();
  });

  it("findBodyParts no groupName", () => {
    const fakeShapes = {
      "general": {
        "front": {
          "Whole Body": [{
            "groupName": "",
            "shapes": [ { "name": "Left Leg" } ]
          }]
        }
      }
    };
    expect(component.findBodyParts(fakeShapes, "Left Leg")).toEqual(["Left Leg"]);
  })

});
