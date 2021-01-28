import { GuiWidgetsModule } from '../gui-widgets/gui-widgets.module';
import { SpinnerModule } from '../spinner/spinner.module';
import { RouteResolverService } from './services/route-resolver.service';
import { ErrorReportingModule } from '../error-reporting/error-reporting.module';
import { GlobalProvidersModule } from '../global-providers/global-providers.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkbenchRoutingModule } from './workbench-routing.module';
import { WorkbenchMainComponent } from './components/main/main.component';
import { IllnessSelectComponent } from './components/illness-select/illness-select.component';
import { EditorLoaderService } from './services/editor-loader.service';
import { SubmitGroupComponent } from './components/submit-group/submit-group.component';
import { DebugBoxComponent } from './components/debug-box/debug-box.component';
import { ValidationModule } from '../validation/validation.module';
import { WorkbenchService } from './services/workbench.service';
import { CreateSymptomComponent } from './components/create-symptom/create-symptom.component';
import { NgbDropdownModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { EditSymptomComponent } from './components/edit-symptom/edit-symptom.component';
import { EditAntithesisComponent } from './components/edit-antithesis/edit-antithesis.component';
import { EditTableValueComponent } from './components/edit-table-value/edit-table-value.component';
import { EditInputValueComponent } from './components/edit-input-value/edit-input-value.component';
import { Ng2CompleterModule } from 'ng2-completer';
import { SymptomSearchModule } from '../shared/symptom-search/symptom-search.module';
import { NgxPageScrollModule } from 'ngx-page-scroll';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    WorkbenchRoutingModule,
    GlobalProvidersModule,
    NgxPageScrollModule,
    ErrorReportingModule,
    SpinnerModule,
    SymptomSearchModule,
    GuiWidgetsModule,
    ValidationModule,
    NgbPaginationModule,
    NgbDropdownModule,
    Ng2CompleterModule,
    PipesModule
  ],
  providers: [RouteResolverService, EditorLoaderService, WorkbenchService],
  declarations: [
    WorkbenchMainComponent,
    IllnessSelectComponent,
    SubmitGroupComponent,
    DebugBoxComponent,
    CreateSymptomComponent,
    EditSymptomComponent,
    EditTableValueComponent,
    EditAntithesisComponent,
    EditInputValueComponent
  ]
})
export class WorkbenchModule { }
