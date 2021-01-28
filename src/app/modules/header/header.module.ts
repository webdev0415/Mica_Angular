import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";

import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";

import { SpinnerModule } from "../spinner/spinner.module";

import { HeaderComponent } from "./header.component";
import { NavComponent } from "./components/nav/nav.component";
import { UserComponent } from "./components/user/user.component";
import { SymptomsComponent } from "./components/symptoms/symptoms.component";
import { TreatmentsComponent } from "./components/treatments/treatments.component";
import { TemplatesComponent } from "./components/templates/templates.component";
import { InspectorComponent } from "./components/inspector/inspector.component";
import { EcwReviewsComponent } from "./components/ecw-reviews/ecw-reviews.component";
import { PipesModule } from "../pipes/pipes.module";
import { GroupsComponent } from "./components/groups/groups.component";
import {
  MatButtonModule,
  MatIconModule,
  MatListModule,
  MatMenuModule,
  MatSidenavModule,
  MatToolbarModule
} from "@angular/material";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SpinnerModule,
    NgbTooltipModule,
    PipesModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule
  ],
  declarations: [
    HeaderComponent,
    NavComponent,
    UserComponent,
    SymptomsComponent,
    TreatmentsComponent,
    TemplatesComponent,
    InspectorComponent,
    EcwReviewsComponent,
    GroupsComponent
  ],
  exports: [HeaderComponent]
})
export class HeaderModule { }
