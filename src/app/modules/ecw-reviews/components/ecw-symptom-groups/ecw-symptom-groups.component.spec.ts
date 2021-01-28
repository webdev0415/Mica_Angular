import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from "@angular/core";
import { EcwSymptomGroupsComponent } from './ecw-symptom-groups.component';
import * as ecwSelectors from "./../../../../state/ecw/ecw.selectors";
import {Observable} from "rxjs";
import { NgRedux} from "@angular-redux/store";
import { defaultState } from "../../../../app.config";
import FormValueSection = Illness.Normalized.FormValueSection;
import {of} from "rxjs/observable/of";


const mockRedux = {
  getState: (): State.Root => defaultState,
  dispatch: (arg: any) => {}
};

@Component({
  selector: 'ecw-submit',
  template: '<div></div>'
})
class MockEcwSubmitGroupsComponent {
}

@Component({
  selector: 'ecw-category-list',
  template: '<div></div>'
})
class MockEcwCategoryListComponent {
  @Input() sectionID: string;
  @Input() categoryIDs: string[];
}

const MockCategories = { cat1: {} }
const MockSections = { sec1: { categories: ["cat1"] } }
const MockSymptomGroups = {
  group1: { sections: ["sec1"] },
  group2: { categories: ["cat1"] }
}

describe('EcwSymptomGroupsComponent', () => {
  let component: EcwSymptomGroupsComponent;
  let fixture: ComponentFixture<EcwSymptomGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EcwSymptomGroupsComponent,
        MockEcwSubmitGroupsComponent,
        MockEcwCategoryListComponent
      ],
      providers: [ { provide: NgRedux, useValue: mockRedux } ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    spyOn(ecwSelectors, 'activeEcwIllness').and.returnValue(() => of({} as ECW.Illness));
    spyOn(ecwSelectors, 'symptomGroupsFromActiveIllness').and.returnValue(() => MockSymptomGroups);
    spyOn(ecwSelectors, 'sectionsFromActiveIllness').and.returnValue(() => MockSections);
    fixture = TestBed.createComponent(EcwSymptomGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should return a class', () => {
    component.groupsComplete = ['general'];
    let sgClass = component.getSGClass('general');
    expect(sgClass).toBe("bg-success");
    sgClass = component.getSGClass('labs');
    expect(sgClass).toBe("bg-warning");
  });

  it("should get categories", () => {
    component.sections = {
      "sec": {
        categories: ["cats"]
      } as FormValueSection
    };
    expect(component.getCategories("sec")).toEqual(["cats"]);
  });

  it("getCategories", () => {
    component.sections = null;
    expect(component.getCategories("17")).toEqual([]);
  });

  it("sgIDs", () => {
    component.symptomGroups = null;
    component.ngOnInit();
    expect(component.sgIDs.length).toEqual(0);
  });

});
