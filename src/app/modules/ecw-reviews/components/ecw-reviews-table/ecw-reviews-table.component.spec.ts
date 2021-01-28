import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { EcwReviewsTableComponent } from "./ecw-reviews-table.component";
import Illness = ECW.Illness;
const fakeIllnesses =  require("../../../../../test/data/ecwIllnesses.json");
describe("EcwReviewTableComponent", () => {
  let component: EcwReviewsTableComponent;
  let fixture: ComponentFixture<EcwReviewsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcwReviewsTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcwReviewsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("should emit new filter", () => {
    const filters = component.filters;
    component.currentFilter = filters[0];
    const mockOnChangeFilter = spyOn(component.onChangeFilter, "emit").and.callThrough();
    component.setFilter(filters[1]);
    expect(mockOnChangeFilter).toHaveBeenCalledWith(filters[1]);
  })

  it("should return not filtred array", () => {
    component.illnesses = fakeIllnesses;
    component.currentFilter = "ALL";
    expect(component.filteredIllnesses).toBe(fakeIllnesses);
  })

  it("should return filtred array", () => {
    const curFilter = component.filters[1];
    component.illnesses = fakeIllnesses;
    component.currentFilter = curFilter;
    const filtered = fakeIllnesses.filter((el: ECW.Illness) => el.status === curFilter);
    expect(component.filteredIllnesses).toEqual(filtered);
  });

  it("ngOnChanges", () => {
    component.filter = undefined;
    component.ngOnChanges();
    expect(component.currentFilter).toEqual("ALL");
  });

  it("setFilter", () => {
    const filter = "ALL";
    component.currentFilter = filter;
    component.filter = filter;
    expect(component.setFilter(filter)).toBeUndefined();
  });

  it("onSelect", () => {
    const onSelectIllnessSpy = spyOn(component.onSelectIllness, "emit").and.callThrough();
    component.onSelect({} as Illness);
    expect(onSelectIllnessSpy).toHaveBeenCalled();
  });

  it("trackByFn", () => {
    expect(component.trackByFn(1, null)).toEqual(1);
  });

  it("ngOnChanges", () => {
    component.filter = "LOADED";
    component.ngOnChanges();
    expect(component.currentFilter).toEqual("LOADED");
  });

});
