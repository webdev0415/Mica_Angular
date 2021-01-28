import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import * as _ from "lodash";

import { SymptomGroupsComponent } from "./symptom-groups.component";
import { IllnessValueComponent } from "../../../error-reporting/illness-value/illness-value.component";
import { IllnessErrorCounterComponent } from "../../../error-reporting/illness-error-counter/illness-error-counter.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { Component, Input } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { defaultState } from "app/app.config";
import { NgRedux } from "@angular-redux/store";
import { RouterTestingModule } from "@angular/router/testing";
import { of } from "rxjs/observable/of";
import * as denormalizedModel from "app/state/denormalized.model";
import * as workbenchSelectors from "app/state/workbench/workbench.selectors";
import { CorrectSpellingPipe } from "../../../pipes/correct-spelling.pipe";
import { UniquenessServiceStub } from "../../../../../test/services-stubs/uniqueness.service.stub";
import { UniquenessService } from "../../services/uniqueness.service";
import { ActivatedRoute } from "@angular/router";

const fakeIllnesses: Illness.Normalized.IllnessValue[] = require("../../../../../test/data/illnesses.json");
(defaultState.workbench.illnesses as any).active = fakeIllnesses[0].form.idIcd10Code;
_.map(fakeIllnesses, (illness: Illness.Normalized.IllnessValue) => defaultState.workbench.illnesses.values[illness.form.idIcd10Code] = illness);

const mockRedux = {
  getState: (): State.Root => {
    return defaultState
  },
  select: (selector) => of(selector(defaultState)),
  dispatch: (arg: any) => {}
};

const mockRouter = {
  snapshot: {
    url: [
      {
        path: "editor"
      }
    ]
  }
};

@Component({
  selector: "review-category-list",
  template: "<div></div>"
})
class MockCategoryListComponent {
  @Input() symptomGroupID: string;
  @Input() readOnly = false;
  @Input() sectionID: string;
  @Input() ecwValidationSymptoms: { [id: string]: Symptom.Value } | null;
}

@Component({
  selector: "review-submit",
  template: "<div></div>"
})
class MockReviewSubmitComponent {
  @Input() syncingIllness = false;
  @Input() isUnique = false;
  @Input() initial = false;
}

@Component({
  selector: "mica-validation-icon",
  template: "<div></div>"
})
class MockIconComponent {
  @Input() idIcd10Code: string;
  @Input() version: number;
}

describe("SymptomGroupsComponent", () => {
  let component: SymptomGroupsComponent;
  let fixture: ComponentFixture<SymptomGroupsComponent>;
  let uniqueService: UniquenessService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SymptomGroupsComponent,
        IllnessValueComponent,
        MockIconComponent,
        MockCategoryListComponent,
        IllnessErrorCounterComponent,
        MockReviewSubmitComponent,
        CorrectSpellingPipe
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        { provide: UniquenessService, useClass: UniquenessServiceStub },
        { provide: ActivatedRoute, useValue: mockRouter },
      ],
      imports: [
        NgbModule,
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    uniqueService = TestBed.get(UniquenessService);
    fixture = TestBed.createComponent(SymptomGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("routerTitle", () => {
    expect(component).toBeTruthy();
  });

  it("sgSections", () => {
    expect(component.sgSections("17")).toEqual([]);
  });

  it("sgSections", () => {
    const s = {...defaultState};
    const illnessId = "17";
    Object.assign(s, {
      workbench: {
        illnesses: {
          active: illnessId,
          values: {
            "17": {
              entities: {
                symptomGroups: {
                  "17": {
                    sections: []
                  }
                }
              }
            }
          }
        }
      }
    });
    spyOnProperty<any>(component, "state", "get").and.returnValue(s);
    expect(component.sgSections("17")).toEqual([]);
  });

  it("getSGClass", () => {
    const groupId = "17";
    const res = "COMPLETE";
    const equal = "bg-success";
    spyOn(component, "getGroupState").and.returnValue(res);
    expect(component.getSGClass(groupId)).toEqual(equal);
  });

  it("getSGClass", () => {
    const groupId = "17";
    const res = "INCOMPLETE";
    spyOn(component, "getGroupState").and.returnValue(res);
    expect(() => component.getSGClass(groupId)).toThrow();
  });

  it("ecwValidationSymptoms", () => {
    spyOn<any>(component, "ecwValidationIllness").and.returnValue({});
    spyOn(denormalizedModel, "normalizeIllness").and.returnValue({
      entities: {
        symptoms: {}
      }
    });
    expect(component.ecwValidationSymptoms).toEqual({});
  });

  it("ecwValidationSymptoms", () => {
    spyOn<any>(component, "ecwValidationIllness").and.returnValue({});
    spyOn(denormalizedModel, "normalizeIllness").and.returnValue({
      entities: null
    });
    expect(component.ecwValidationSymptoms).toEqual({});
  });

  it("getGroupState", () => {
    spyOn(workbenchSelectors, "isSymptomGroupComplete").and.returnValue(() => "complete");
    expect(component.getGroupState("17")).toEqual("COMPLETE");
  });

  it("trackSectionByFn", () => {
    expect(component.trackSectionByFn(1, {sectionID: "id"} as any)).toEqual("id");
  });

  it("onCheckUniquenessResult", () => {
    let res = null;
    component["onCheckUniquenessResult"](res);
    res = [{}];
    component.isUnique = false;
    component["onCheckUniquenessResult"](res);
    expect(component.isUnique).toBeFalsy();
  });

  it("ngOnInit", () => {
    const route = {
      snapshot: {
        url: [
          {
            path: "review"
          }
        ]
      }
    } as ActivatedRoute;
    const onCheckUniquenessSpy = spyOn<any>(component, "onCheckUniqueness").and.callThrough();
    component["route"] = route;
    component.ngOnInit();
    expect(onCheckUniquenessSpy).not.toHaveBeenCalled();
  });

  it("illnessValue", () => {
    spyOnProperty(component, "readOnlyIllness", "get").and.returnValue("readonly");
    spyOnProperty(component, "activeIllnessValue", "get").and.returnValue("active");

    component.readOnly = true;
    expect(component.illnessValue).toEqual(component.readOnlyIllness);

    component.readOnly = false;
    expect(component.illnessValue).toEqual(component.activeIllnessValue);
  });

});
