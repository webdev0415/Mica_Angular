import { SymptomModule } from "./../../symptom/symptom.module";
import { PipesModule } from "./../../pipes/pipes.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SymptomsListComponent } from "./symptoms-list/symptoms-list.component";
import { NgbPaginationModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SpinnerModule } from "app/modules/spinner/spinner.module";
import { TemplateSearchComponent } from "app/modules/symptom-template/components/search/search.component";


@NgModule({
  imports: [
    CommonModule,
    PipesModule,
    SymptomModule,
    NgbPaginationModule,
    SpinnerModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [SymptomsListComponent, TemplateSearchComponent],
  exports: [SymptomsListComponent, TemplateSearchComponent]
})
export class SharedModule { }
