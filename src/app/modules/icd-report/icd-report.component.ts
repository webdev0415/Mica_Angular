import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef, EventEmitter, ViewChild
} from "@angular/core";
import { CsvService } from "./services/csv.service"
import { Illness } from "test/data/csv-test";
import {TypeaheadComponent} from "../typeahead/typeahead.component";

@Component({
  selector: "icd-report",
  templateUrl: "./icd-report.component.html",
  styleUrls: ["./icd-report.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class IcdReportComponent implements OnInit, OnDestroy {
  fileName: string;
  illnesses: Illness.FormValue[];
  downloadClicked = false;
  @ViewChild("typeaheadChild", {static: false}) typeahead: TypeaheadComponent;

  constructor(private cd: ChangeDetectorRef,
              private csv: CsvService,
            ) { }

  ngOnInit() {

  }

  ngOnDestroy() {
  }

  downloadCSV() {
    this.downloadClicked = true;
    this.csv.createAndDownload(this.illnesses, this.fileName);
    this.fileName = "";
    this.typeahead.setValueAfterDownload();
  }

  onSelectItems(emitterClose: EventEmitter<boolean>) {
    emitterClose.emit(true);
    this.downloadClicked = false;
    this.fileName = this.illnesses.map(ill => `${ill.idIcd10Code}v${ill.version}`).join("_") + ".csv";
    this.illnesses = this.illnesses.map(ill => this.valueWithoutEmptySymptoms(ill));
  }

  filterItems(items: MICA.SelectableEl[]) {
    const collections: any = {};
    items.forEach(item => {
      const icd = item.value.idIcd10Code;
      if (!collections[icd]) {
        collections[icd] = [];
      }
      collections[icd].push(item.value as Illness.FormValue);
    })
    this.illnesses =  Object.keys(collections)
      .map(key => collections[key]
        .filter((ill: Illness.FormValue) => ill.state === "APPROVED")
        .sort((a: Illness.FormValue, b: Illness.FormValue) => b.version - a.version)
        [0]
      )
      .filter(el => !!el)
      .sort((a, b) => a.idIcd10Code.replace(/[^\d\.]/ig, "") - b.idIcd10Code.replace(/[^\d\.]/ig, ""))
    return this.illnesses;
  }

  checkItems(items: MICA.SelectableEl[]) {
    return items.some(item => item.value.state === "APPROVED")
  }

  valueWithoutEmptySymptoms(data: Illness.FormValue): Illness.FormValue {
    const symptomGroups = data.symptomGroups.map(group => {
      const categories = group.categories && this.categoryWithoutEmptySymptoms(group.categories);
      const sections = group.sections && group.sections
        .filter(sec => sec.categories)
        .map(sec =>  ({
            ...sec,
            categories: this.categoryWithoutEmptySymptoms(sec.categories)
        }))
        return categories ? {...group, categories} : {...group, sections}
    })
    return {
      ...data,
      symptomGroups
    }
  }

  categoryWithoutEmptySymptoms(categories: Illness.FormValueCategory[]) {
    return categories.filter(cat => cat.symptoms.length)
  }

}
