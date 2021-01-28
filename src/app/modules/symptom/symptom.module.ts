import { TypeaheadModule } from "../typeahead/typeahead.module";
import { BodySelectorModule } from "../body-selector/body-selector.module";
import { GuiWidgetsModule } from "../gui-widgets/gui-widgets.module";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { PipesModule } from "../pipes/pipes.module";
import { DirectivesModule } from "../directives/directives.module";

import { SymptomComponent } from "./symptom.component";
import { BiasComponent } from "./bias/bias.component";
import { LikelihoodComponent } from "./likelihood/likelihood.component";
import { MultiplierComponent } from "./multiplier/multiplier.component";
import { ScaleComponent } from "./scale/scale.component";
import { CountryComponent } from "./multiplier/country/country.component";
import { RowsComponent } from "./rows/rows.component";
import { SymptomRowComponent } from "./rows/row/row.component";
import { MultiplierInputComponent } from "./multiplier/input/input.component";

import { ApiService } from "./services/api.service";
import { DataService } from "./services/data.service";
import { MultiplierLoaderComponent } from "./multiplier/loader/loader.component";
import { RangerComponent } from "./multiplier/ranger/ranger.component";
import { DescriptorImageComponent } from "./descriptor-image/descriptor-image.component";
import { DescriptorToggleComponent } from "./descriptor-toggle/descriptor-toggle.component";
import { ModifierComponent } from "./modifier/modifier.component";
import { ModifierRowComponent } from "./modifier/row/modifier-row.component";
import { TitleRowComponent } from "./title-row/title-row.component";
import { ScaleButtonComponent } from "./scale/scale-button/scale-button.component";
import { SharedModule } from "../shared/shared.module";

@NgModule({
  declarations: [
    SymptomComponent,
    BiasComponent,
    LikelihoodComponent,
    MultiplierComponent,
    ScaleComponent,
    CountryComponent,
    SymptomRowComponent,
    MultiplierInputComponent,
    MultiplierLoaderComponent,
    RangerComponent,
    RowsComponent,
    DescriptorImageComponent,
    DescriptorToggleComponent,
    ModifierComponent,
    ModifierRowComponent,
    TitleRowComponent,
    ScaleButtonComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    TypeaheadModule,
    PipesModule,
    DirectivesModule,
    CommonModule,
    GuiWidgetsModule,
    BodySelectorModule,
    SharedModule
  ],
  providers: [
    ApiService,
    DataService
  ],
  exports: [
    SymptomComponent
  ]
})
export class SymptomModule { }
