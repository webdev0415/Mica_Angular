import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApprovedIllnessesRoutingModule } from "./approved-illnesses-routing.module";
import { ApprovedIllnessesComponent } from "./approved-illnesses.component";
import { SymptomSearchComponent } from "./symptom-search/symptom-search.component";
import { ReactiveFormsModule } from "@angular/forms";
import { SpinnerModule } from "../spinner/spinner.module";
import { NgbDropdownModule, NgbPaginationModule } from "@ng-bootstrap/ng-bootstrap";
import { IllnessService } from "../../services";
import { IllnessesTableComponent } from "./illnesses-table/illnesses-table.component";

@NgModule({
  imports: [
    CommonModule,
    ApprovedIllnessesRoutingModule,
    ReactiveFormsModule,
    SpinnerModule,
    NgbPaginationModule,
    NgbDropdownModule
  ],
  declarations: [
   ApprovedIllnessesComponent,
   SymptomSearchComponent,
   IllnessesTableComponent
  ],
  providers: [
    IllnessService
  ]
})
export class ApprovedIllnessesModule { }
