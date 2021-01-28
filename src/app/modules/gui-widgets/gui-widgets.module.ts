import { ReactiveFormsModule } from "@angular/forms";
import { CriticalityComponent } from "./criticality/criticality.component";
import { NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import { ModalComponent } from "./components/modal/modal.component";
import { ChipsComponent } from "./components/chips/chips.component";
import { PipesModule } from "./../pipes/pipes.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ValueSwitchComponent } from "./components/value-switch/value-switch.component";
import { CheckSwitchComponent } from "./components/check-switch/check-switch.component";
import { BadgeIconComponent } from "./components/badge-icon/badge-icon.component";
import { DropdownComponent } from "./components/dropdown/dropdown.component";

@NgModule({
  imports: [
    CommonModule,
    PipesModule,
    NgbModalModule,
    ReactiveFormsModule
  ],
  declarations: [
    ValueSwitchComponent,
    CheckSwitchComponent,
    BadgeIconComponent,
    DropdownComponent,
    ChipsComponent,
    ModalComponent,
    CriticalityComponent
  ],
  exports: [
    ValueSwitchComponent,
    CheckSwitchComponent,
    BadgeIconComponent,
    DropdownComponent,
    ChipsComponent,
    CriticalityComponent
  ],
  entryComponents: [
    ModalComponent
  ],
})
export class GuiWidgetsModule { }
