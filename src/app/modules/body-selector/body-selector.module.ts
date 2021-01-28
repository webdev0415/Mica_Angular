import { PipesModule } from '../pipes/pipes.module';
import { BodySelectorComponent } from './body-selector.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    PipesModule
  ],
  declarations: [
    BodySelectorComponent
  ],
  exports: [
    BodySelectorComponent
  ]
})
export class BodySelectorModule { }
