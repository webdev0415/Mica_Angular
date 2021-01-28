import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { GroupsRoutingModule } from "./groups-routing.module";
import { DirectivesModule } from "../directives/directives.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SpinnerModule } from "../spinner/spinner.module";
import { GroupsComponent } from "./groups/groups.component";
import { GroupsListComponent } from "./components/groups-list/groups-list.component";
import { GroupsSearchComponent } from "./components/groups-search/groups-search.component";
import { TreatmentsApiService } from "../treatments/services/treatments-api.service";
import { SharedModule } from "../workbench/shared/shared.module";
import { PipesModule } from "../pipes/pipes.module";
import { NgbModule, NgbPaginationModule } from "@ng-bootstrap/ng-bootstrap";


@NgModule({
  declarations: [GroupsComponent, GroupsListComponent, GroupsSearchComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DirectivesModule,
    SpinnerModule,
    GroupsRoutingModule,
    SharedModule,
    PipesModule,
    NgbPaginationModule,
    NgbModule
  ],
  providers: [
    TreatmentsApiService
  ],
  exports: [GroupsComponent, GroupsListComponent, GroupsSearchComponent]
})
export class GroupsModule { }
