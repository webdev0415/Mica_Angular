import { SharedModule } from "../../shared/shared.module";
import { PipesModule } from "./../../../pipes/pipes.module";
import { ErrorReportingModule } from "./../../../error-reporting/error-reporting.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { WorkbenchDefaultLayoutComponent } from "./components/layout/layout.component";
import { WorkbenchDefaultRoutingModule } from "./default-routing.module";

@NgModule({
  imports: [
    CommonModule,
    WorkbenchDefaultRoutingModule,
    ErrorReportingModule,
    PipesModule,
    SharedModule
  ],
  declarations: [WorkbenchDefaultLayoutComponent]
})
export class WorkbenchDefaultModule { }
