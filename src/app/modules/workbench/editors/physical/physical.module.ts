import { FormsModule } from "@angular/forms";
import { GuiWidgetsModule } from "./../../../gui-widgets/gui-widgets.module";
import { BodySelectorModule } from "./../../../body-selector/body-selector.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../../shared/shared.module";

import { PhysicalRoutingModule } from "./physical-routing.module";
import { WorkbenchPhysicalLayoutComponent } from "./components/layout/layout.component";
import { BodyPartSelectorComponent } from "./components/body-part-selector/body-part-selector.component";

@NgModule({
  imports: [
    CommonModule,
    PhysicalRoutingModule,
    BodySelectorModule,
    GuiWidgetsModule,
    SharedModule,
    FormsModule
  ],
  declarations: [WorkbenchPhysicalLayoutComponent, BodyPartSelectorComponent]
})
export class WorkbenchPhysicalModule { }
