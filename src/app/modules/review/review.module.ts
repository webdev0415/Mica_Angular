import { ValidationModule } from "../validation/validation.module";
import { SymptomGroupsComponent } from "./components/symptom-groups/symptom-groups.component";
import { TypeaheadModule } from "../typeahead/typeahead.module";
import { NgbModalModule, NgbPopoverModule, NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { RequiredDataService } from "./services/required-data.service";
import { RouteResolverService } from "./services/route-resolver.service";
import { GuiWidgetsModule } from "../gui-widgets/gui-widgets.module";
import { PipesModule } from "../pipes/pipes.module";
import { SymptomReviewComponent } from "./components/symptom-review/symptom-review.component";
import { SymptomReviewNewComponent } from "./components/symptom-review-new/symptom-review-new.component";
import { CategoryListComponent } from "./components/category-list/category-list.component";
import { ReactiveFormsModule } from "@angular/forms";
import { ReviewSubmitComponent } from "./components/review-submit/review-submit.component";
import { ErrorReportingModule } from "../error-reporting/error-reporting.module";
import { SpinnerModule } from "../spinner/spinner.module";
import { ReviewRoutingModule } from "./review-routing.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReviewEditorComponent } from "./components/editor/editor.component";
import { DataValidationComponent } from "./components/data-validation/data-validation.component";
import { UniquenessService } from "./services/uniqueness.service";
import { IllnessSearchComponent } from "./components/illness-search/illness-search.component";
import { SyncingBtnComponent } from "./components/syncing-btn/syncing-btn.component";
import { InspectorComponent } from "./components/inspector/inspector.component";
import { UniquenessModalComponent } from "./components/uniqueness-modal/uniqueness-modal.component";
import { SourceTooltipComponent } from "./components/source-tooltip/source-tooltip.component";
import { IcdReportModule } from "../icd-report/icd-report.module";
import { SymptomModule } from "../symptom/symptom.module";
import { SvgShapesService } from "app/services/svgShapes.service";

@NgModule({
  imports: [
    CommonModule,
    ReviewRoutingModule,
    SpinnerModule,
    ErrorReportingModule,
    ReactiveFormsModule,
    PipesModule,
    GuiWidgetsModule,
    NgbModalModule,
    NgbTooltipModule,
    NgbPopoverModule,
    ReactiveFormsModule,
    TypeaheadModule,
    ValidationModule,
    IcdReportModule,
    SymptomModule,
  ],
  declarations: [
    ReviewEditorComponent,
    SymptomGroupsComponent,
    DataValidationComponent,
    ReviewSubmitComponent,
    CategoryListComponent,
    SymptomReviewComponent,
    SymptomReviewNewComponent,
    IllnessSearchComponent,
    SyncingBtnComponent,
    InspectorComponent,
    UniquenessModalComponent,
    SourceTooltipComponent,
  ],
  providers: [
    RouteResolverService,
    RequiredDataService,
    UniquenessService,
    SvgShapesService,
  ],
  entryComponents: [
    UniquenessModalComponent
  ]
})
export class ReviewModule { }
