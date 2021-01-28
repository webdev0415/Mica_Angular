import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { SymptomSearchComponent } from "./symptom-search.component";
import {IllnessesTableComponent} from "../illnesses-table/illnesses-table.component";
import {SpinnerModule} from "../../spinner/spinner.module";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {defaultState} from "../../../app.config";
import {NgRedux} from "@angular-redux/store";
import {NgbDropdownModule, NgbPaginationModule} from "@ng-bootstrap/ng-bootstrap";
import {IllnessService} from "../../../services";
import {IllnessServiceStub} from "../../../../test/services-stubs/illness.service.stub";
import * as symptomsSelectors from "../../../state/symptoms/symptoms.selectors";
const mockRedux = {
  getState: (): State.Root => defaultState,
  dispatch: (arg: any) => {}
};

describe("SymptomSearchComponent", () => {
  let component: SymptomSearchComponent;
  let fixture: ComponentFixture<SymptomSearchComponent>;
  let redux: NgRedux<State.Root>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SpinnerModule,
        FormsModule,
        ReactiveFormsModule,
        NgbPaginationModule,
        NgbDropdownModule
      ],
      declarations: [
        SymptomSearchComponent,
        IllnessesTableComponent
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        { provide: IllnessService, useClass: IllnessServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SymptomSearchComponent);
    component = fixture.componentInstance;
    redux = TestBed.get(NgRedux);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("onSelect", () => {
    component.searching = false;
    component.onSelect("id", "name");
    expect(component.searching).toBeFalsy();
    expect(component.symptomData).toEqual({
      symptomID: "id",
      symptomName: "name"
    });
  });

  it("onClose", () => {
    const searchCtrl = new FormControl("");
    component.searchCtrl = searchCtrl;
    const inputRef = {nativeElement: {focus: () => {}}};
    component.inputRef = inputRef;
    component.focusOnSearch = false;
    const setValueSpy = spyOn(component.searchCtrl, "setValue").and.callThrough();
    component.onClose();
    expect(component.focusOnSearch).toBeTruthy();
    expect(component.searchFailed).toBeFalsy();
    expect(setValueSpy).toHaveBeenCalled();
  });

  it("state", () => {
    const s = {};
    spyOn(redux, "getState").and.returnValue(s);
    expect(component["state"]).toEqual(s as any);
  });

  it("onSearchCtrlChange", () => {
    const term = "";
    component.searchResults.next([{} as any]);
    const nextSpy = spyOn(component.searchResults, "next").and.callThrough();
    component.searchFailed = true;
    component["onSearchCtrlChange"](term);
    expect(component.searchFailed).toBeFalsy();
    expect(nextSpy).toHaveBeenCalledWith([]);
  });

  it("onSearchCtrlChange", () => {
    const term = "";
    component.searchResults.next([]);
    const nextSpy = spyOn(component.searchResults, "next").and.callThrough();
    component.searchFailed = true;
    component["onSearchCtrlChange"](term);
    expect(component.searchFailed).toBeFalsy();
    expect(nextSpy).not.toHaveBeenCalledWith([]);
  });

  it("onSearchCtrlChange", () => {
    const term = "term";
    component.focusOnSearch = false;
    const nextSpy = spyOn(component.searchResults, "next").and.callThrough();
    spyOn(symptomsSelectors, "findSymptomLive").and.returnValue(() => {
      return {
        name: "name",
        symptomID: "symptomId"
      }
    });
    component["onSearchCtrlChange"](term);
    expect(component.focusOnSearch).toBeTruthy();
    expect(nextSpy).toHaveBeenCalled();
  });

  it("onSearchCtrlChange", () => {
    const term = "term";
    component.searchFailed = false;
    const nextSpy = spyOn(component.searchResults, "next").and.callThrough();
    spyOn(symptomsSelectors, "findSymptomLive").and.returnValue(() => []);
    component["onSearchCtrlChange"](term);
    expect(component.searchFailed).toBeTruthy();
    expect(nextSpy).toHaveBeenCalled();
    expect(component.symptomData.symptomName).toEqual("");
    expect(component.symptomData.symptomID).toEqual("");
  });
});
