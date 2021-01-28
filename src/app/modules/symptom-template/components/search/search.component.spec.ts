import { async, ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { TemplateSearchComponent } from "./search.component";
import { NgRedux } from "@angular-redux/store";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { defaultState } from "../../../../app.config";
import { InlineSpinnerComponent } from "../../../spinner/inline-spinner/inline-spinner.component";
import { TemplateService } from "app/services/template.service";
import { TemplateServiceStub } from "../../../../../test/services-stubs/template.service.stub";
import { of } from "rxjs/observable/of";

const mockRedux = {
  getState: () => {
    return defaultState;
  },
  select: (selector) => of(selector(defaultState)),
  dispatch: (arg: any) => {}
};


describe("TemplateSearchComponent", () => {
  let component: TemplateSearchComponent;
  let fixture: ComponentFixture<TemplateSearchComponent>;
  let templateService: TemplateServiceStub;
  let redux: NgRedux<State.Root>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TemplateSearchComponent,
        InlineSpinnerComponent
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        { provide: TemplateService, useClass: TemplateServiceStub }
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    templateService = TestBed.get(TemplateService);
    fixture = TestBed.createComponent(TemplateSearchComponent);
    redux = TestBed.get(NgRedux);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("onSearch", () => {
    const template = {
      symptomID: "someSymptomID",
      icdrCode: "icdrCode",
      antithesis: {one: 1, two: 2},
      icd10RCodes: {one: "code1", two: "code2"},
      criticality: 231,
      question: "what?",
      treatable: true
    };
    const mockGetTemplate = spyOn(templateService, "getTemplate");

    mockGetTemplate.and.returnValue(of(template));
    component.onSearch(template.symptomID);
    expect(mockGetTemplate).toHaveBeenCalledWith(template.symptomID);
  });

  it("get state", () => {
    expect(component["state"]).toEqual(defaultState);
  });

  it("onClose", () => {
    const setValueSpy = spyOn(component.searchCtrl, "setValue").and.callThrough();

    component.onClose();
    expect(setValueSpy).toHaveBeenCalled();
    expect(component.searchFailed).toBeFalsy();
    expect(component.focusOnSearch).toBeTruthy();
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

  it("handleGetTemplate", () => {
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();

    component["handleGetTemplate"](null);
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it("handleGetTemplateError", fakeAsync(() => {
    const err = {};

    expect(() => {
      component["handleGetTemplateError"](err).subscribe(res => res);
      tick();
    }).toThrow();
  }));

  it("should emit selectedItem onSelectValue", () => {
    const result = { name: "PTSD Screening", value: "SYMPT0003912" };
    const selectedItemSyp = spyOn(component.selectedItem, "emit").and.callThrough();

    component["onSelectValue"](result);
    expect(selectedItemSyp).toHaveBeenCalledWith(result);
  });

  it("ngOnChanges", () => {
    component.searchCtrl.setValue("");
    const currentValue = "query";
    const changes = { searchQuery: { currentValue } };
    const setValueSpy = spyOn(component.searchCtrl, "setValue").and.callThrough();

    component.ngOnChanges(<any>{});
    expect(setValueSpy).not.toHaveBeenCalled();

    component.ngOnChanges(<any>changes);
    expect(setValueSpy).toHaveBeenCalledWith(currentValue);
  });

  it("ngOnChanges set empty", () => {
    const currentValue = "";
    const changes = { searchQuery: { currentValue } };
    const setValueSpy = spyOn(component.searchCtrl, "setValue").and.callThrough();
    component.ngOnChanges(<any>changes);

    expect(setValueSpy).toHaveBeenCalledWith(currentValue);
  });

  it("unsubcribe on ngOnDestroy", () => {
    const sub = of({}).subscribe();
    const unsubscribeSpy = spyOn(sub, "unsubscribe").and.callThrough();
    component["subs"].push(sub);
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
