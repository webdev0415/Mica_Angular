import { FormsModule } from '@angular/forms';
import { TypeaheadModule } from "./../../../typeahead/typeahead.module";
import { GuiWidgetsModule } from "./../../../gui-widgets/gui-widgets.module";
import { PipesModule } from "./../../../pipes/pipes.module";
import { BodySelectorModule } from "./../../../body-selector/body-selector.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../../shared/shared.module";

import { PainRoutingModule } from "./pain-routing.module";
import { WorkbenchPainLayoutComponent } from "./components/layout/layout.component";

@NgModule({
  imports: [
    CommonModule,
    PainRoutingModule,
    BodySelectorModule,
    PipesModule,
    GuiWidgetsModule,
    TypeaheadModule,
    SharedModule,
    FormsModule
  ],
  declarations: [WorkbenchPainLayoutComponent]
})
export class WorkbenchPainModule { }
