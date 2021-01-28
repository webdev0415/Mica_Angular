import {async, ComponentFixture, fakeAsync, flushMicrotasks, TestBed, tick} from "@angular/core/testing";

import { WorkbenchDefaultLayoutComponent } from './layout.component';
import {ErrorBoxComponent} from "../../../../../error-reporting/box/box.component";
import {TitleCasePipe} from "../../../../../pipes/title-case.pipe";
import {Component, Input} from "@angular/core";
import {NgRedux, NgReduxModule} from "@angular-redux/store";
import {NgReduxTestingModule} from "@angular-redux/store/testing";
import {navInit} from "../../../../../../app.config";
import {PageScrollService} from "ngx-page-scroll";
import {RouterTestingModule} from "@angular/router/testing";
import {testRoutes} from "../../../../../../../test/data/test-routes";
import {TestComponent} from "../../../../../../../test/test.component";
import * as symptomsSelectors from "./../../../../../../state/symptoms/symptoms.selectors";
import {Observable} from "rxjs";
import {OutputSelector} from "reselect";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {SET_ACTIVE_CAT} from "../../../../../../state/nav/nav.actions";
import {of} from "rxjs/observable/of";
import SymptomGroupBasic = Workbench.Normalized.SymptomGroupBasic;
const fakeUsers = require("../../../../../../../test/data/users.json");

@Component({
  selector: 'workbench-symptoms-list',
  template: '<div></div>'
})
class MockSymptomsListComponent {
  @Input() bodyView: string;
  @Input() bodyParts: string[] = [];
  @Input() bodyPartsAll: string[] = [];
}

const mockRedux = {
  getState: () => {
    return {
      user: fakeUsers[0],
      nav: navInit
    }
  },
  dispatch: (arg: any) => {}
};

xdescribe('WorkbenchDefaultLayoutComponent', () => {
  let component: WorkbenchDefaultLayoutComponent;
  let fixture: ComponentFixture<WorkbenchDefaultLayoutComponent>;
  let redux: NgRedux<State.Root>;
  let categoryNameSpy;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        WorkbenchDefaultLayoutComponent,
        ErrorBoxComponent,
        MockSymptomsListComponent,
        TitleCasePipe,
        TestComponent
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        { provide: NgReduxModule, useClass: NgReduxTestingModule },
        PageScrollService
      ],
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule.withRoutes(testRoutes)
      ]
    })
    .compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    spyOn(symptomsSelectors, 'activeSymptomGroupData').and.returnValue({
      categories: ['cat1', 'cat2', 'cat3'],
      sections: undefined
    });
    fixture = TestBed.createComponent(WorkbenchDefaultLayoutComponent);
    redux = TestBed.get(NgRedux);
    component = fixture.componentInstance;
    categoryNameSpy = spyOn(component, "categoryName").and.callFake(a => a);
    fixture.detectChanges();
    flushMicrotasks();
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('onSelectCategory', fakeAsync(() => {
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    const evt = new Event("click");
    const evtSpy = spyOn(evt, "preventDefault").and.callThrough();
    component.onSelectCategory("17", evt);
    expect(evtSpy).toHaveBeenCalled();
    expect(component["animateCategory"]).toBeTruthy();
    tick(1000);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: SET_ACTIVE_CAT,
      id: "17"
    });
  }));

  it("categoryState", () => {
    component["animateCategory"] = true;
    expect(component.categoryState).toEqual("animated");
  });

  it("ngOnInit", () => {
    spyOnProperty<any>(component, "activeCategoryIDSync", "get").and.returnValue("17");
    spyOnProperty<any>(component, "sgDataSync", "get").and.returnValue({categories: ["18"]});
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    component.ngOnInit();
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("ngOnInit", () => {
    spyOnProperty<any>(component, "activeCategoryIDSync", "get").and.returnValue("17");
    spyOnProperty<any>(component, "sgDataSync", "get").and.returnValue({categories: ["17"]});
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    component.ngOnInit();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("onSelectCategory", () => {
    expect(component.onSelectCategory("17", null)).toBeUndefined();
  });

  it("onSelectNextCategory", () => {
    spyOnProperty<any>(component, "activeCategoryIDSync", "get").and.returnValue("17");
    spyOnProperty<any>(component, "sgDataSync", "get").and.returnValue({categories: ["17"]});
    const selectSpy = spyOn(component, "onSelectCategory").and.callThrough();
    component.onSelectNextCategory();
    expect(selectSpy).toHaveBeenCalled();
  });

  it("onSelectNextCategory", () => {
    spyOnProperty<any>(component, "activeCategoryIDSync", "get").and.returnValue("18");
    spyOnProperty<any>(component, "sgDataSync", "get").and.returnValue({categories: ["18", "17"]});
    const selectSpy = spyOn(component, "onSelectCategory").and.callThrough();
    component.onSelectNextCategory();
    expect(selectSpy).toHaveBeenCalled();
  });

  it("ngOnInit", () => {
    spyOnProperty(component, "sgData", "get").and.returnValue(of({categories: []}));
    component.ngOnInit();
    component.categories.subscribe(cats => {
      expect(cats).toEqual([]);
    });
  });

  it("categoryName", () => {
    categoryNameSpy.and.callThrough();
    spyOn(symptomsSelectors, "catNameFromID").and.callFake(() => () => {return ""});
    expect(component.categoryName("id")).toBeDefined();
  });

  it("nextCategoryName", () => {
    spyOnProperty(component, "activeCategoryIDNext", "get").and.returnValue(of(""));
    spyOn(symptomsSelectors, "catNameFromID").and.callFake(() => () => {return ""});
    component.nextCategoryName.subscribe(val => {
      expect(val).toEqual("");
    });
  });

  it("placeCoreSymptomsAtFirst", () => {
    const coreSymptomCategory = "core";
    const categories = ["a", "b", coreSymptomCategory];
    expect(component["placeCoreSymptomsAtFirst"](categories)[0]).toEqual(coreSymptomCategory);
  });

  it("placeCoreSymptomsAtFirst", () => {
    const nonCoreSymptomCategory = "normal";
    const categories = ["a", "b", nonCoreSymptomCategory];
    expect(component["placeCoreSymptomsAtFirst"](categories)[0]).not.toEqual(nonCoreSymptomCategory);
  });

  it("placeCoreSymptomsAtFirstInSymptomGroup", () => {
    const coreSymptomCategory = "core";
    const categories = ["a", "b", coreSymptomCategory];
    const symptomGroup = {
      categories: categories
    } as SymptomGroupBasic;
    expect(component["placeCoreSymptomsAtFirstInSymptomGroup"](symptomGroup).categories[0]).toEqual(coreSymptomCategory);
  });

  it("placeCoreSymptomsAtFirstInSymptomGroup", () => {
    expect(component["placeCoreSymptomsAtFirstInSymptomGroup"](null).categories.length).toEqual(0);
  });
});
