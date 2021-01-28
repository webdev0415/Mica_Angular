import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IcdReportComponent } from "./icd-report.component"
// import { ReactiveFormsModule } from "@angular/forms";
import { TypeaheadModule } from "./../typeahead/typeahead.module";
import { CsvService } from "./services/csv.service";
// import { SpinnerModule } from "../../spinner/spinner.module";

@NgModule({
  imports: [
    CommonModule,
    // ReactiveFormsModule,
    TypeaheadModule,
  ],
  declarations: [
    IcdReportComponent,
  ],
  exports: [
    IcdReportComponent,
  ],
  providers: [
    CsvService,
  ]
})

export class IcdReportModule { }
