import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IcdReportComponent } from "./icd-report.component";
import { CsvService } from "./services/csv.service";
import { Component, Input, EventEmitter } from "@angular/core";

const mockCsvService = {
  createAndDownload: () => {}
}

@Component({
  selector: "mica-typeahead",
  template: "<div></div>"
})
class MockMicaTypeheadComponent {
  @Input() placeholder: string;
  @Input() canClose: Boolean;
  @Input() typeAheadMin: number;
  @Input() liveSearchType: string;
  @Input() icd10CodeSearch: Boolean;
  @Input() templateRef: any;
  setValueAfterDownload = jasmine.createSpy("setValueAfterDownload").and.returnValue(null);
}

describe("IcdReportComponent", () => {
  let component: IcdReportComponent;
  let fixture: ComponentFixture<IcdReportComponent>;
  let csvService: CsvService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        IcdReportComponent,
        MockMicaTypeheadComponent
      ],
      providers: [ {provide: CsvService, useValue: mockCsvService} ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcdReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    csvService = TestBed.get(CsvService);
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("downloadCSV", () => {
    const createAndDownload = spyOn(csvService, "createAndDownload");
    component.downloadCSV();
    expect(createAndDownload).toHaveBeenCalled();
    expect(component.typeahead.setValueAfterDownload).toHaveBeenCalled();
  });

  it("onSelect", () => {
    const item = {
      value: { idIcd10Code: "code", version: "1", name: "Name" }
    } as MICA.SelectableEl;
    const emmiter = new EventEmitter() as EventEmitter<boolean>;
    const illness = {} as Illness.FormValue;
    const mockEmmiter = spyOn(emmiter, "emit");
    const mockFunc = spyOn(component, "valueWithoutEmptySymptoms").and.returnValue(illness);
    component.illnesses = [item.value];

    component.onSelectItems(emmiter);
    expect(mockEmmiter).toHaveBeenCalled();
    expect(mockFunc).toHaveBeenCalled();
    expect(component.illnesses).toEqual([illness]);
    expect(component.fileName).toBe("codev1.csv");
  });

  it("valueWithoutEmptySymptoms", () => {
    const IllnessData = {
      name: "Carbuncle of face",
      idIcd10Code: "L02.03",
      version: 10,
      criticality: 7,
      state: "COMPLETE" as Illness.State,
      groupsComplete: [],
      symptomGroups: [
        { groupID: "general", categories: [] },
        { groupID: "pain", sections: [{ sectionID: "SC001", categories: [] }] }
      ]
    } as Illness.FormValue;

    const value = component.valueWithoutEmptySymptoms(IllnessData);
    expect(value).toEqual(IllnessData);
  });

  it("categoryWithoutEmptySymptoms", () => {
    const categories = [
      { categoryID: "SYMPTCG01", symptoms: [{}, {}] },
      { categoryID: "SYMPTCG01", symptoms: [] }
    ] as Illness.FormValueCategory[];

    const value = component.categoryWithoutEmptySymptoms(categories);
    expect(value.length).toBe(1);
  });

  it("checkItems", () => {
    const items = [
      {
        value: {
          state: "APPROVED"
        }
      }
    ];
    expect(component.checkItems(items as any)).toBeTruthy();
  });

  it("filterItems", () => {
    const items = [
      {
        value: {
          idIcd10Code: "code",
          state: "APPROVED",
          version: 1
        }
      },
      {
        value: {
          idIcd10Code: "code",
          state: "APPROVED",
          version: 2
        }
      },
      {
        value: {
          idIcd10Code: "code2",
          state: "APPROVED",
          version: 2
        }
      }
    ];
    expect(component.filterItems(items as any).length).toEqual(2);
  });
});
