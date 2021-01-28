import { TestBed } from "@angular/core/testing";
import { NgRedux } from "@angular-redux/store";
import { defaultState } from "../../../app.config";
import { CsvService } from "./csv.service";
import * as symptomSelectors from "../../../state/symptoms/symptoms.selectors";
import { Illness, category, symptom, row } from "../../../../test/data/csv-test"
import RowValue = Symptom.RowValue;
import FormValueCategory = Illness.FormValueCategory;

const mockRedux = {
  getState: (): State.Root => defaultState
};

describe("CsvService", () => {
  let service: CsvService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CsvService,
        { provide: NgRedux, useValue: mockRedux }
      ]
    });
    service = TestBed.get(CsvService);
    spyOn(symptomSelectors, "sectionNameFromID").and.returnValue(() => "sectionNameFromID");
    spyOn(symptomSelectors, "catNameFromID").and.returnValue(() => "catNameFromID");
    spyOn(symptomSelectors, "symptomData").and.returnValue(() => ({
      name: "Name",
      criticality: "1",
      antithesis: "1",
      question: "question"
    }));
  });

  it("should create", () => {
    expect(service).toBeTruthy();
  });

  it("createAndDownload", () => {
    const createElement =  spyOn(document, "createElement").and.callThrough();
    const appendChild = spyOn(document.body, "appendChild").and.callThrough();
    const removeChild = spyOn(document.body, "removeChild").and.callThrough();
    const createObjectURL = spyOn(URL, "createObjectURL").and.callThrough();
    const revokeObjectURL = spyOn(URL, "revokeObjectURL").and.callThrough();

    const blob = new Blob(["\ufeff", Illness.csv], { type: "text/csv" });
    spyOn(service, "generateCSVForAllIllness").and.returnValue([])
    service.createAndDownload([Illness.data as Illness.FormValue], "testName");

    expect(createElement).toHaveBeenCalledWith("a");
    expect(createObjectURL).toHaveBeenCalledWith(blob)
    expect(appendChild).toHaveBeenCalled();
    expect(removeChild).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalled();
  })

  it("generateCSVForAllIllness", () => {
    const csv = service.generateCSVForAllIllness([Illness.data as Illness.FormValue]);
    expect(csv).toBe(Illness.csv);
  });

  it("getSymptomsFromCategories", () => {
    const symptoms = service.getSymptomsFromCategories([category.data as Illness.FormValueCategory])
    expect(symptoms).toEqual(category.data.symptoms);
  })

  it("symptomToCSV", () => {
    const csvCat = service.symptomToCSV(symptom.data as Symptom.Value, "L02.03", "physical")
    expect(csvCat).toEqual(symptom.csvPhysical as string[])
  })

  it("symptomRowToCSV", () => {
    const csvRow = service.symptomRowsToCSV([row.data as Symptom.RowValue])
    expect(csvRow).toEqual(row.csv as string[])
  })

  it("symptomRowsToCSV", () => {
    service.options.delimiter = " ";
    const rows = [
      {
        modifierValues: null,
        multiplier: ["multiplier"]
      } as RowValue
    ];
    expect(service.symptomRowsToCSV(rows)).toBeDefined();
  });

  it("symptomRowsToCSV", () => {
    service.options.delimiter = " ";
    const rows = [
      {
        modifierValues: null,
        multiplier: null
      } as RowValue
    ];
    expect(service.symptomRowsToCSV(rows)).toBeDefined();
  });

  it("symptomRowsToCSV", () => {
    service.options.delimiter = " ";
    const rows = [
      {
        modifierValues: [
          {
            likelihood: "likelihood"
          }
        ]
      } as RowValue
    ];
    expect(service.symptomRowsToCSV(rows)).toBeDefined();
  });

  it("getSymptomsFromCategories", () => {
    const categories = [
      {
        symptoms: []
      } as FormValueCategory
    ];
    expect(service.getSymptomsFromCategories(categories)).toEqual([]);
  });

});

