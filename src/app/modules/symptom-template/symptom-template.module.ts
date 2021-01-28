import { GuardsModule } from "./../guards/guards.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import { SpinnerModule } from "../spinner/spinner.module";
import { PipesModule } from "../pipes/pipes.module";
import { GuiWidgetsModule } from "../gui-widgets/gui-widgets.module";

import { SymptomTemplateRoutingModule } from "./symptom-template-routing.module";
// import { LayoutComponent } from "./components/layout/layout.component";
// import { TemplateSearchComponent } from "./components/search/search.component";
import { TableComponent } from "./components/table/table.component";
import { EditorComponent } from "./components/editor/editor.component";
import { TemplateService } from "../../services/template.service";
import { AntithesisComponent } from "./components/antithesis/antithesis.component";
import { SnomedCodesComponent } from "./components/snomed-codes/snomed-codes.component";
import { TableValueComponent } from "./components/table/table-value/table-value.component";
import { TableArrayValueComponent } from "./components/table/table-array-value/table-array-value.component";
import { ErrorFinderComponent } from "./components/error-finder/error-finder.component";
import { MultiplierValueComponent } from "./components/table/multiplier-value/multiplier-value.component";
import { InputValueEditComponent } from "./components/input-value-edit/input-value-edit.component";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { InputArrayValueEditComponent } from "./components/input-array-value-edit/input-array-value-edit.component";
import { DirectivesModule } from "../directives/directives.module";
import { TypeaheadModule } from "../typeahead/typeahead.module";
import { SharedModule } from "../workbench/shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SpinnerModule,
    NgbTooltipModule,
    TypeaheadModule,
    PipesModule,
    GuiWidgetsModule,
    GuardsModule,
    SymptomTemplateRoutingModule,
    DirectivesModule,
    SharedModule
  ],
  declarations: [
    // LayoutComponent,
    // TemplateSearchComponent,
    TableComponent,
    EditorComponent,
    AntithesisComponent,
    SnomedCodesComponent,
    TableValueComponent,
    TableArrayValueComponent,
    ErrorFinderComponent,
    MultiplierValueComponent,
    InputValueEditComponent,
    InputArrayValueEditComponent
  ]
})
export class SymptomTemplateModule { }
