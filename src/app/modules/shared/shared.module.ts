import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SourceFormComponent } from './source-form/source-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectivesModule } from '../directives/directives.module';
import { SourceRemovalModalComponent } from './source-form/source-removal-modal/source-removal-modal.component';
import { PipesModule } from '../pipes/pipes.module';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule, MatCheckboxModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
  MatRadioModule,
  MatTableModule
} from '@angular/material';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { DrugSearchComponent } from './drug-search/drug-search.component';
import { DrugLikelihoodComponent } from './drug-likelihood/drug-likelihood.component';
import { IllnessSearchComponent } from './illness-search/illness-search.component';
import { WarningFormComponent } from './warning/warning-form/warning-form.component';
import { WarningListComponent } from './warning/warning-list/warning-list.component';
import { WarningComponent } from './warning/warning.component';

const modalComponents = [
  SourceRemovalModalComponent,
  ConfirmationModalComponent,
];

@NgModule({
  declarations: [
    ...modalComponents,

    SourceFormComponent,
    DrugSearchComponent,
    DrugLikelihoodComponent,
    IllnessSearchComponent,
    WarningFormComponent,
    WarningListComponent,
    WarningComponent,
  ],
  exports: [
    SourceFormComponent,
    DrugSearchComponent,
    DrugLikelihoodComponent,
    IllnessSearchComponent,
    WarningComponent,
    WarningFormComponent,
    WarningListComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DirectivesModule,
    FormsModule,
    PipesModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatTableModule,
    MatDialogModule,
    MatButtonToggleModule,
    MatRadioModule,
    MatCheckboxModule,
  ],
  entryComponents: [
    ...modalComponents
  ]
})
export class SharedModule { }
