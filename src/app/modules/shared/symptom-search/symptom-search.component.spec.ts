import { async, ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { Router } from "@angular/router";
import { NgRedux } from "@angular-redux/store";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SymptomSearchComponent } from "./symptom-search.component";
import { InlineSpinnerComponent } from "../../spinner/inline-spinner/inline-spinner.component";
import { defaultState } from "../../../app.config";
import { of } from "rxjs/observable/of";
import LocationData = Symptom.LocationData;

const mockRouter = {
  navigate: jasmine.createSpy("navigate"),
};

const mockRedux = {
  getState: () => {
    return defaultState
  },
  select: (selector) => of(selector(defaultState)),
  dispatch: (arg: any) => {}
};

describe("SymptomSearchComponent", () => {
  let component: SymptomSearchComponent;
  let fixture: ComponentFixture<SymptomSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SymptomSearchComponent,
        InlineSpinnerComponent
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        { provide: Router, useValue: mockRouter },
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SymptomSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("onSelect", () => {
    component.searching = true;
    const symptom = {
      symptomID: "someSymptomID"
    };
    mockRouter.navigate.and.returnValue(Promise.resolve(""));
    component.onSelect(symptom.symptomID);
    expect(component.searching).toBeFalsy();
  });

  it("searchCtrl should return", fakeAsync(() => {
    const searchResultsSpy = spyOn(component.searchResults, "next").and.callThrough();
    component.ngOnInit();
    component.searchCtrl.setValue("");
    component.searchResults.next([{name: "name"}] as MICA.SelectableEl[]);
    tick(100);
    expect(searchResultsSpy).toHaveBeenCalled();
  }));

  it("searchCtrl should not return", fakeAsync(() => {
    const searchResultsSpy = spyOn(component.searchResults, "next").and.callThrough();
    component.ngOnInit();
    component.searchCtrl.setValue("17");
    component.searchResults.next([{name: "name"}] as MICA.SelectableEl[]);
    tick(100);
    expect(searchResultsSpy).toHaveBeenCalled();
  }));

  it("searchCtrl should not return", fakeAsync(() => {
    const s = {...defaultState};
    Object.assign(s, {symptoms: {entities: {symptoms: {"17": {name: "17"}}}}});
    spyOnProperty<any>(component, "state", "get").and.returnValue(s);
    component.ngOnInit();
    component.searchCtrl.setValue("17");
    tick(100);
    expect(component.searchFailed).toBeFalsy();
  }));

  it("onClose", () => {
    const setValueSpy = spyOn(component.searchCtrl, "setValue").and.callThrough();
    component.onClose();
    expect(setValueSpy).toHaveBeenCalled();
  });

  it("getQueryParams", () => {
    const loc = {
      symptomGroup: "physical",
      categoryName: "body"
    } as LocationData;
    expect(component["getQueryParams"](loc, "id")).toBeDefined();
  });

  it("onNavigateError", () => {
    const consoleSpy = spyOn(console, "error").and.callThrough();
    component["onNavigateError"]({});
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("handleClick: when target is the search input", () => {
    const event = { target: 1 };

    component.focusOnSearch = true;
    component.inputRef.nativeElement = 1;
    component.handleClick(event);
    expect(component.focusOnSearch).toEqual(true);
  });

  it("handleClick: when target is not the search input", () => {
    const event = { target: 2 };

    component.focusOnSearch = true;
    component.inputRef.nativeElement = 1;
    component.handleClick(event);
    expect(component.focusOnSearch).toEqual(false);
  });
});
