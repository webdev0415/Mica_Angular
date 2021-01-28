import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SymptomSearchComponent } from "./symptom-search.component"
import { ReactiveFormsModule } from "@angular/forms";
import { SpinnerModule } from "../../spinner/spinner.module";

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SpinnerModule
  ],
  declarations: [
    SymptomSearchComponent,
  ],
  exports: [
    SymptomSearchComponent,
  ]
})

export class SymptomSearchModule { }
