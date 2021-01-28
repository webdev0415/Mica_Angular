import { async, ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import * as _ from "lodash";
import { SymptomsListComponent } from "./symptoms-list.component";
import { TitleCasePipe } from "app/modules/pipes/title-case.pipe";
import { RouterTestingModule } from "@angular/router/testing";
import { testRoutes } from "../../../../../test/data/test-routes";
import { TestComponent } from "../../../../../test/test.component";
import { Component, Input } from "@angular/core";
import { NgRedux } from "@angular-redux/store";
import { defaultState } from "app/app.config";
import { Router } from "@angular/router";
import Data = Symptom.Data;
import { of } from "rxjs";
import * as symptomsSelectors from "app/state/symptoms/symptoms.selectors";
import Subgroup1 = Symptom.Subgroup1;
import Subgroup2 = Symptom.Subgroup2;
import { NgbPaginationModule } from "@ng-bootstrap/ng-bootstrap";
import { SymptomService } from "app/services";
import { SymptomServiceStub } from "../../../../../test/services-stubs/symtom.service.stub";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

const mockRouter = {
  navigate: jasmine.createSpy("navigate")
};
const state = _.cloneDeep(defaultState);
const mockRedux = {
  getState: (): State.Root => state,
  dispatch: (arg: any) => {
  },
  select: () => {}
};

@Component({
  selector: "mica-symptom",
  template: "<div></div>"
})
class MockSymptomComponent {
  @Input() readonly symptomID: string;
  @Input() nlpSymptom: boolean;
  @Input() readonly basicSymptomID: string;
  @Input() bodyParts: string[] = [];
  @Input() bodyPartsAll: string[] = [];
  @Input() indexVal = 0;
}

@Component({
  selector: "mica-page-spinner",
  template: "<div></div>"
})
class MockMicaPageSpinerComponent {
  @Input() message: string;
}

describe("SymptomsListComponent", () => {
  let component: SymptomsListComponent;
  let fixture: ComponentFixture<SymptomsListComponent>;
  let redux: NgRedux<State.Root>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SymptomsListComponent,
        TestComponent,
        TitleCasePipe,
        MockSymptomComponent,
        MockMicaPageSpinerComponent,
      ],
      providers: [
        {provide: NgRedux, useValue: mockRedux},
        {provide: Router, useValue: mockRouter},
        {provide: SymptomService, useClass: SymptomServiceStub}
      ],
      imports: [
        RouterTestingModule.withRoutes(testRoutes),
        NgbPaginationModule,
        FormsModule,
        ReactiveFormsModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SymptomsListComponent);
    component = fixture.componentInstance;
    redux = TestBed.get(NgRedux);
    component.categoryID = "ssssss";
    component["disablePagination"] = () => {};
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("activeBodyViewSymptoms empty", () => {
    component.activeBodyViewSymptoms.subscribe(data => expect(data).toEqual([]));
  });

  it("activeBodyViewSymptoms", () => {
    component.bodyView = "bodyView";
    component.activeBodyViewSymptoms.subscribe(data => expect(data).not.toEqual([]));
  });

  it("groupAndReduceSymptoms", () => {
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    component["groupAndReduceSymptoms"]([{ subGroups: ["1", "2"] } as any]);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("groupAndReduceSymptoms", () => {
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    component["groupAndReduceSymptoms"]([{ subGroups: ["1", "2", 3] } as any]);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("groupAndReduceSymptoms", () => {
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    component["groupAndReduceSymptoms"]([{ subGroups: null } as any]);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("getSymptoms", () => {
    const ss: any = [];
    expect(component["getSymptoms"](ss)).toBeUndefined();
  });

  it("valuesAreEqual", () => {
    expect(component["valuesAreEqual"](1, 1)).toBeTruthy();
  });

  it("state", () => {
    spyOn(redux, "getState").and.returnValue({});
    expect(component["state"]).toEqual({} as State.Root);
  });

  it("trackByFn", () => {
    const value = {
      symptomID: "17"
    } as Data;
    expect(component.trackByFn(1, value)).toEqual(value.symptomID);
  });

  it("getSymptomData", () => {
    const selectSpy = spyOn(redux, "select").and.callThrough();
    const symptomDataManySpy = spyOn(symptomsSelectors, "symptomDataMany").and.callThrough();

    component["getSymptomData"](["1"]);
    expect(selectSpy).toHaveBeenCalled();
    expect(symptomDataManySpy).toHaveBeenCalled();
  });

  it("handleSbg2", () => {
    const symptom = { name: "name" } as Data;
    const sbg1 = {} as Subgroup1;
    const sbg2 = { symptoms: [] } as Subgroup2;
    const sbg2Title = "title";

    expect(component["handleSbg2"](symptom, sbg1, sbg2, sbg2Title)).toBeUndefined();
  });

  it("handleSbg2", () => {
    const symptom = {} as Data;
    const sbg1 = { subgroup2: [] } as Subgroup1;
    const sbg2 = undefined;
    const sbg2Title = "title";

    expect(component["handleSbg2"](symptom, sbg1, sbg2, sbg2Title)).toBeUndefined();
  });

  it("handleSbg2 with Basic Symptoms", () => {
    const basicSymptom = { painSwellingID: 8, symptomID: "basicID", name: "Basic Pain" } as Symptom.Data;
    const sbg1: Subgroup1 = { title: "Basic burn", subgroup2: [], basicSymptomID: "SYMPT0003116" };
    let sbg2 = undefined;
    const sbg2Title = "title";

    expect(component["handleSbg2"](basicSymptom, sbg1, sbg2, sbg2Title)).toBeUndefined();

    sbg2  = { title: "Basic burn", symptoms: [], basicSymptomID: "SYMPT0003116" };
    expect(component["handleSbg2"](basicSymptom, sbg1, sbg2, sbg2Title)).toBeUndefined();
  });


  it("sortByBasic", () => {
    const basicSymptom = { painSwellingID: 8, symptomID: "basicID" } as Symptom.Data;
    const sympt = { painSwellingID: 1, symptomID: "ID" } as Symptom.Data;
    const arrayWithBasic: Symptom.Data[] = [sympt, basicSymptom, sympt];

    component["sortByBasic"](arrayWithBasic);
    expect(arrayWithBasic).toEqual([basicSymptom, sympt, sympt]);
  });

  it("isBasic", () => {
    const basicSymptom = { painSwellingID: 8, symptomID: "basicID" } as Symptom.Data;
    const sympt = { painSwellingID: 1, symptomID: "ID" } as Symptom.Data;

    expect(component["isBasic"](basicSymptom)).toBeTruthy();
    expect(component["isBasic"](sympt)).toBeFalsy();
  });

  it("triggerChangeDetection", () => {
    const setGroupsSpy = spyOn<any>(component, "setGroups").and.callFake(() => {});
    component["triggerChangeDetection"]();
    expect(setGroupsSpy).toHaveBeenCalled();
  });

  it("enablePagination", () => {
    component.navigating = true;
    component["enablePagination"]();
    expect(component.navigating).toBeFalsy();
  });

  it("disablePagination", () => {
    component.navigating = false;
    component["disablePagination"]();
  });

  it("totalNlpSymptoms", () => {
    const totalSpy = spyOn(symptomsSelectors, "totalNlpSymptoms").and.callThrough();
    component.total;
    expect(totalSpy).toHaveBeenCalled();
  });

  it("ngOnInit", fakeAsync(() => {
    const pageChangedSpy = spyOn(component, "pageChanged");

    spyOn(symptomsSelectors, "nlpGroupIsActive").and.returnValue(false);
    component.ngOnInit();
    tick(10);
    expect(pageChangedSpy).not.toHaveBeenCalled();
  }));

  it("ngOnInit nlp", fakeAsync(() => {
    const pageChangedSpy = spyOn(component, "pageChanged");
    spyOn(symptomsSelectors, "nlpGroupIsActive").and.returnValue(true);
    component.ngOnInit();
    tick(10);
    expect(pageChangedSpy).toHaveBeenCalled();
  }));

  it("pageChanged invalid", () => {
    component.navigating = false; // disablePagination
    component.searchControl.setValue("12");
    component.pageChanged(1);
    expect(component.navigating).toBeFalsy();
  });

  it("page", () => {
    const nlpSymptomsPageSpy = spyOn(symptomsSelectors, "nlpSymptomsPage").and.callFake(() => {});

    component.page;
    expect(nlpSymptomsPageSpy).toHaveBeenCalled();
    component.pageChanged(1);
  });

  it("clearSearchField", () => {
    component.searchControl.setValue("term");
    component.clearSearchField();
    expect(component.searchControl.value).toEqual("");
  });

  it("getBasicSymptomFromSubGroup", () => {
    const subGroup2: Subgroup2 = { title: "Basic Pain", symptoms: [], basicSymptomID: "SYMPT0003117" };
    const subGroup1: Subgroup1 = { title: "Basic burn", subgroup2: [], basicSymptomID: "SYMPT0003116" };
    let returnFn = component.getBasicSymptomFromSubGroup(subGroup1, subGroup2);

    expect(returnFn).toEqual(subGroup1.basicSymptomID as string);

    subGroup1.basicSymptomID = undefined;
    returnFn = component.getBasicSymptomFromSubGroup(subGroup1, subGroup2);
    expect(returnFn).toEqual(subGroup2.basicSymptomID as string);
  });

});
