import { ValidationModule } from "../validation/validation.module";
import { GuiWidgetsModule } from "../gui-widgets/gui-widgets.module";
import { FormsModule } from "@angular/forms";
import { TypeaheadModule } from "../typeahead/typeahead.module";
import { PipesModule } from "../pipes/pipes.module";
import { NgbTypeaheadModule } from "@ng-bootstrap/ng-bootstrap";
import { ErrorReportingModule } from "../error-reporting/error-reporting.module";
import { SpinnerModule } from "../spinner/spinner.module";
import { TasksComponent } from "./tasks/tasks.component";
import { TaskIncludesComponent } from "./task-includes/task-includes.component";
import { CopyIllnessComponent } from "./copy-illness/copy-illness.component";
import { LayoutComponent } from "./layout/layout.component";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgbModalModule } from "@ng-bootstrap/ng-bootstrap"
import { HomeRoutingModule } from "./home-routing.module";
import { HomeService } from "./home.service";

@NgModule({
  imports: [
    CommonModule,
    HomeRoutingModule,
    SpinnerModule,
    ErrorReportingModule,
    NgbTypeaheadModule,
    PipesModule,
    TypeaheadModule,
    FormsModule,
    GuiWidgetsModule,
    NgbModalModule,
    ValidationModule
  ],
  declarations: [
    LayoutComponent,
    CopyIllnessComponent,
    TaskIncludesComponent,
    TasksComponent,
  ],
  providers: [HomeService]
})
export class HomeModule { }
