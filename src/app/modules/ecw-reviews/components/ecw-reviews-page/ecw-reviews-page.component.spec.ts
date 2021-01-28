import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { NgbPaginationModule, NgbDropdownModule } from "@ng-bootstrap/ng-bootstrap";
import { SpinnerModule } from "../../../spinner/spinner.module";
import { EcwReviewsPageComponent } from "./ecw-reviews-page.component";
import { EcwReviewsTableComponent } from "../ecw-reviews-table/ecw-reviews-table.component";
import { EcwService } from "../../../../services/ecw.service"
import { EcwServiceStub } from "../../../../../test/services-stubs/ecw.service.stub"
import { Router } from "@angular/router";
import { NgRedux } from "@angular-redux/store";
import { defaultState } from "../../../../app.config";
import Illness = ECW.Illness;
import {of, throwError} from "rxjs";

const mockRouter = {
  navigate: jasmine.createSpy("navigate")
};

const mockRedux = {
  getState: (): State.Root => defaultState,
  dispatch: (arg: any) => {}
};

describe("EcwReviewPageComponent", () => {
  let component: EcwReviewsPageComponent;
  let ecwService: EcwServiceStub;
  let fixture: ComponentFixture<EcwReviewsPageComponent>;
  let redux: NgRedux<State.Root>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbPaginationModule,
        NgbDropdownModule,
        SpinnerModule,
      ],
      declarations: [
        EcwReviewsPageComponent,
        EcwReviewsTableComponent
      ],
      providers: [
        { provide: EcwService, useClass: EcwServiceStub },
        { provide: Router, useValue: mockRouter },
        { provide: NgRedux, useValue: mockRedux },
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EcwReviewsPageComponent);
    component = fixture.componentInstance;
    ecwService = TestBed.get(EcwService);
    redux = TestBed.get(NgRedux);
    // spyOn(ecwService, 'getIllnesses').and.returnValue(Observable.of(res))
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
    expect(component.illnesses.length).toBe(41);
    expect(component.totalElements).toBe(2388)
  });

  it("should get ECW Illnesses", () => {
    const getIllnesses = spyOn(ecwService, "getIllnesses").and.callThrough();
    component.illnesses = [];
    component.totalElements = 0;
    component.getEcwIllnesses();
    expect(component.illnesses[0]).toBeTruthy();
    expect(component.totalElements).toBe(2388);
  });

  it("should set page size", () => {
    const setPageSize = spyOn(component, "changePage").and.callThrough();
    component.pageSize = 20;
    component.setPageSize(20);
    expect(component.pageSize).toBe(20);
    expect(setPageSize).not.toHaveBeenCalled();
    component.setPageSize(40);
    expect(component.pageSize).toBe(40);
    expect(setPageSize).toHaveBeenCalledWith(1);
  })

  it("should set filter", () => {
    const status = "FINAL"
    component.filter = "ALL";
    component.onChangeFilter(status);
    expect(component.filter).toBe(status);
  })

  it("should be get IllnessData", () => {
    component.loadingData = false;
    const getIllnesses = spyOn(ecwService, "getIllnessByIcd10Code").and.callThrough();
    component.getIllnessData("H00.013");
    expect(component.loadingData).toBe(false);
    expect(getIllnesses).toHaveBeenCalledWith("H00.013");
  });

  it("should goToReview return nothing", () => {
    expect(component.goToReview(null)).toBeUndefined();
  });

  it("gotoReview", () => {
    const illness = {
      icd10Code: "17"
    } as Illness;
    const getIllnessDataSpy = spyOn(component, "getIllnessData").and.callThrough();
    component.goToReview(illness);
    expect(getIllnessDataSpy).toHaveBeenCalledWith(illness.icd10Code);
  });

  it("changePage", () => {
    component.loadingData = true;
    component["ecwSub"] = of({}).subscribe();
    const getEcwIllnessesSpy = spyOn(component, "getEcwIllnesses").and.callFake(() => {});
    component.page = 1;
    const page = 2;
    component.changePage(page);
    expect(getEcwIllnessesSpy).toHaveBeenCalled();
    expect(component.page).toEqual(page);
  });

  it("onGetIllnessDataError", () => {
    expect(() => component["onGetIllnessDataError"]({})).toThrow();
    expect(component.loadingData).toBeFalsy();
  });

  it("onGetEcwIllnessesError", () => {
    expect(() => component["onGetEcwIllnessesError"]({})).toThrow();
    expect(component.loadingData).toBeFalsy();
  });

});
