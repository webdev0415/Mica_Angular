import { DirectivesModule } from '../directives/directives.module';
import { GuardsModule } from '../guards/guards.module';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


import { NgbModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { DragulaModule } from 'ng2-dragula';

import { PipesModule } from '../pipes/pipes.module';
import { TreatmentsRoutingModule } from './treatments-routing.module';
import { SpinnerModule } from '../spinner/spinner.module';

import { TreatmentsSearchComponent } from './components/search/search.component';
import { ByIllnessComponent } from './components/by-illness/by-illness.component';
import { TreatmentsApiService } from './services/treatments-api.service';
import { TypeaheadModule } from '../typeahead/typeahead.module';
import { CopyComponent } from './components/copy/copy.component';
import { RecordSelectorComponent } from './components/record-selector/record-selector.component';
import {
  MatAutocompleteModule,
  MatButtonModule, MatButtonToggleModule, MatCheckboxModule, MatDialogModule, MatExpansionModule,
  MatIconModule,
  MatInputModule, MatListModule,
  MatOptionModule, MatProgressBarModule, MatProgressSpinnerModule, MatRadioModule,
  MatSelectModule, MatStepperModule,
  MatTabsModule, MatTooltipModule,
  MatCardModule
} from '@angular/material';
import { DrugTreatmentComponent } from './components/drug-treatment/drug-treatment.component';
import { NonDrugTreatmentComponent } from './components/non-drug-treatment/non-drug-treatment.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TreatmentGroupComponent } from './components/treatment-group/treatment-group.component';
import { SharedModule } from '../shared/shared.module';
import { StoreModule } from '@ngrx/store';
import * as fromTreatments from './state/treatments.reducer';
import { DrugDialogComponent } from './components/drug-treatment/drug-dialog/drug-dialog.component';
import { NonDrugDialogComponent } from './components/non-drug-treatment/non-drug-dialog/non-drug-dialog.component';
import { EffectsModule } from '@ngrx/effects';
import { TreatmentsEffects } from './state/treatments.effects';
import { SelectDrugComponent } from './components/drug-treatment/drug-dialog/select-drug/select-drug.component';
import { DosageComponent } from './components/drug-treatment/drug-dialog/dosage/dosage.component';
import { DrugReviewComponent } from './components/drug-treatment/drug-dialog/drug-review/drug-review.component';
import { AddPoliciesComponent } from './components/drug-treatment/drug-dialog/add-policies/add-policies.component';
import { AddDrugSourcesComponent } from './components/drug-treatment/drug-dialog/add-drug-sources/add-drug-sources.component';
import { TreatmentInfoComponent } from './components/treatment-group/treatment-info/treatment-info.component';
import { MatDividerModule } from '@angular/material/divider';
import { SelectNonDrugComponent } from './components/non-drug-treatment/non-drug-dialog/select-non-drug/select-non-drug.component';
import { AddNonDrugSourcesComponent } from './components/non-drug-treatment/non-drug-dialog/add-non-drug-sources/add-non-drug-sources.component';
import { NonDrugReviewComponent } from './components/non-drug-treatment/non-drug-dialog/non-drug-review/non-drug-review.component';
import { ByDrugComponent } from './components/by-drug/by-drug.component';
import { TreatmentsPageComponent } from './components/treatments-page/treatments-page.component';
import { ByDrugEffects } from './components/by-drug/state/by-drug.effects.';
import { DrugRestrictionsFormComponent } from './components/by-drug/drug-restrictions-form/drug-restrictions-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TreatmentsRoutingModule,
    PipesModule,
    SpinnerModule,
    NgbTypeaheadModule,
    DragulaModule.forRoot(),
    TypeaheadModule,
    GuardsModule,
    DirectivesModule,
    NgbModule,
    MatOptionModule,
    MatSelectModule,
    MatInputModule,
    MatAutocompleteModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    DragDropModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatStepperModule,
    MatListModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatButtonToggleModule,
    MatCardModule,
    SharedModule,
    StoreModule.forFeature(fromTreatments.storeKey, fromTreatments.reducer),
    EffectsModule.forFeature([TreatmentsEffects, ByDrugEffects]),
    MatCheckboxModule,
    MatDividerModule
  ],
  declarations: [
    ByIllnessComponent,
    TreatmentsSearchComponent,
    CopyComponent,
    RecordSelectorComponent,
    DrugTreatmentComponent,
    NonDrugTreatmentComponent,
    TreatmentGroupComponent,
    DrugDialogComponent,
    NonDrugDialogComponent,
    SelectDrugComponent,
    AddPoliciesComponent,
    DosageComponent,
    DrugReviewComponent,
    AddDrugSourcesComponent,
    AddNonDrugSourcesComponent,
    TreatmentInfoComponent,
    NonDrugReviewComponent,
    SelectNonDrugComponent,
    ByDrugComponent,
    TreatmentsPageComponent,
    DrugRestrictionsFormComponent
  ],
  providers: [TreatmentsApiService],
  entryComponents: [
    DrugDialogComponent,
    NonDrugDialogComponent
  ]
})

export class TreatmentsModule {}
