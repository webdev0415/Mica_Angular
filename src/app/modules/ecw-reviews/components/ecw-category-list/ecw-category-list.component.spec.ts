import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from "@angular/core";
import { EcwCategoryListComponent } from './ecw-category-list.component';
import { PipesModule } from "../../../pipes/pipes.module";
import { GuiWidgetsModule } from "../../../gui-widgets/gui-widgets.module";
import { NgRedux} from "@angular-redux/store";
import { defaultState } from "../../../../app.config";
import * as ecwSelectors from "./../../../../state/ecw/ecw.selectors";
import * as symptomSelectors from "../../../../state/symptoms/symptoms.selectors";


const mockRedux = {
  getState: (): State.Root => defaultState,
  dispatch: (arg: any) => {}
};

@Component({
  selector: 'ecw-symptom-review',
  template: '<div></div>'
})
class MockEcwSymptomReviewComponent{
  @Input() symptomsIDs: any;
  @Input() categoryID: string;
}


describe('EcwCategoryListComponent', () => {
  let component: EcwCategoryListComponent;
  let fixture: ComponentFixture<EcwCategoryListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[
        PipesModule,
        GuiWidgetsModule
      ],
      declarations: [
        EcwCategoryListComponent,
        MockEcwSymptomReviewComponent
      ],
      providers: [ { provide: NgRedux, useValue: mockRedux } ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcwCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('sould return the symptoms', () => {
    const categories = { cat1: { symptoms: ["symptom1"] } };
    spyOn(ecwSelectors, "categoriesFromActiveIllness").and.returnValue(categories);
    expect(component.getSymptoms("cat1")).toEqual(["symptom1"]);
  })

  it('sould return section name', () => {
    spyOn(symptomSelectors, "sectionNameFromID").and.returnValue(() => "sectionName");
    component.sectionID = "sectionID";
    expect(component.sectionName).toBe("sectionName");
    component.sectionID = "";
    expect(component.sectionName).toBe("");
  })

  it('should trackByFn', () => {
    expect(component.trackByFn(1, ({categoryID: "categoryID"} as Illness.FormValueCategory))).toBe("categoryID");
  });

  it("should getCatName", () => {
    expect(component.getCatName("17")).toEqual("");
  })

});
