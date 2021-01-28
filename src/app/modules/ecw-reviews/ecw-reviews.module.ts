import { GuardsModule } from "./../guards/guards.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgbPaginationModule, NgbDropdownModule } from "@ng-bootstrap/ng-bootstrap";
import { SpinnerModule } from "../spinner/spinner.module";
import { PipesModule } from "../pipes/pipes.module";
import { GuiWidgetsModule } from "./../gui-widgets/gui-widgets.module";

import { EcwReviewsRoutingModule } from "./ecw-reviews-routing.module";
import { EcwService } from "../../services/ecw.service";
import { EcwReviewsPageComponent } from "./components/ecw-reviews-page/ecw-reviews-page.component";
import { EcwReviewsTableComponent } from "./components/ecw-reviews-table/ecw-reviews-table.component";
import { EcwEditorComponent } from "./components/ecw-editor/ecw-editor.component";
import { EcwSymptomGroupsComponent } from "./components/ecw-symptom-groups/ecw-symptom-groups.component";
import { EcwSubmitGroupsComponent } from "./components/ecw-submit/ecw-submit.component"
import { EcwCategoryListComponent } from "./components/ecw-category-list/ecw-category-list.component"
import { EcwSymptomReviewComponent } from "./components/ecw-symptom-review/ecw-symptom-review.component"

@NgModule({
  imports: [
    CommonModule,
    SpinnerModule,
    NgbPaginationModule,
    NgbDropdownModule,
    GuardsModule,
    EcwReviewsRoutingModule,
    PipesModule,
    GuiWidgetsModule
  ],
  declarations: [
    EcwReviewsPageComponent,
    EcwReviewsTableComponent,
    EcwEditorComponent,
    EcwSymptomGroupsComponent,
    EcwSubmitGroupsComponent,
    EcwCategoryListComponent,
    EcwSymptomReviewComponent
  ],
  providers: [EcwService]
})
export class EcwReviewsModule { }
