import { async, ComponentFixture, TestBed, fakeAsync } from "@angular/core/testing";

import { CategoryListComponent } from "./category-list.component";
import {TitleCasePipe} from "../../../pipes/title-case.pipe";
import {Component, Input} from "@angular/core";
import {defaultState} from "../../../../app.config";
import {Observable} from "rxjs";
import {NgRedux} from "@angular-redux/store";
import {of} from "rxjs/observable/of";
import * as symptomsSelectors from "../../../../state/symptoms/symptoms.selectors";
import FormValueCategory = Illness.FormValueCategory;
import { SvgShapesService } from "app/services/svgShapes.service";

const mockRedux = {
  getState: (): State.Root => {
    return defaultState
  },
  select: (selector) => of(selector(defaultState)),
  dispatch: (arg: any) => {}
};

const mockSvgShapes = {
  getShapesByGroup: (id: string) => of(null)
}

@Component({
  selector: "symptom-review",
  template: "<div></div>"
})
class MockSymptomReviewComponent {
  @Input() symptomGroupID: string;
  @Input() categoryID: string;
  @Input() ecwValidationSymptoms: { [id: string]: Symptom.Value } | null;
}

@Component({
  selector: "symptom-review-new",
  template: "<div></div>"
})
class MockSymptomReviewNewComponent {
  @Input() readOnly = false;
  @Input() symptomGroupID: string;
  @Input() categoryID: string;
  @Input() ecwValidationSymptoms: { [id: string]: Symptom.Value } | null;
  @Input() svgShapes: MICA.BodyImage.ViewSVGMap | null;
}

describe("CategoryListComponent", () => {
  let component: CategoryListComponent;
  let fixture: ComponentFixture<CategoryListComponent>;
  let redux: NgRedux<State.Root>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CategoryListComponent,
        MockSymptomReviewComponent,
        MockSymptomReviewNewComponent,
        TitleCasePipe
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        { provide: SvgShapesService, useValue: mockSvgShapes }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryListComponent);
    component = fixture.componentInstance;
    redux = TestBed.get(NgRedux);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("catsValue", fakeAsync(() => {
    component.sectionID = "id";
    component.ngOnInit();
    component.catsValue.subscribe(val => expect(val).toBeDefined());
  }));

  it("getCategories", fakeAsync(() => {
    spyOn(redux, "select").and.returnValue(of({}));
    component.sectionID = "";
    component["getCategories"]().subscribe(val => {
      expect(val).toEqual({} as any);
    });
  }));

  it("getEntityCategories", fakeAsync(() => {
    const symptomGroupID = "17"
    component.symptomGroupID = symptomGroupID;
    const illness = {
      symptomGroups: [
        {groupID: symptomGroupID}
      ],
      entities: {
        categories: {
          "1": {
          }
        }
      }
    };

    spyOn(redux, "select").and.returnValue(of(illness));
    component["getEntityCategories"]().subscribe(val => {
      expect(val).toEqual([]);
    })
  }));

  it("catsValue", fakeAsync(() => {
    spyOn<any>(component, "getCategories").and.returnValue(of([
      {categoryID: "17", symptoms: [{}]},
      {categoryID: "18", symptoms: [{}]},
      {categoryID: "20", symptoms: []},
      {categoryID: "21"},
    ]));
    spyOn<any>(component, "getEntityCategories").and.returnValue(of([
      {categoryID: "17", symptoms: [{}]},
      {categoryID: "16", symptoms: [{}]}
    ]));
    component.ngOnInit();
    component.catsValue.subscribe(val => {
      expect(val.map(v => v.categoryID)).toEqual(["16", "17", "18"]);
    });
  }));

  it("sectionName", () => {
     spyOn(symptomsSelectors, "sectionNameFromID").and.returnValue(() => {
       return "name"
     });
     expect(component.sectionName).toEqual("name");
  });

  it("trackByFn", () => {
     expect(component.trackByFn(1, {categoryID: "id"} as FormValueCategory)).toEqual("id");
  });

  it("getCatName", () => {
     spyOn(symptomsSelectors, "catNameFromID").and.returnValue(() => {
       return "name";
     });
     expect(component.getCatName({} as FormValueCategory)).toEqual("name");
  });
});
