import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SymptomLinksRoutingModule } from './symptom-links-routing.module';
import { LinkContainerComponent } from './link-container/link-container.component';


@NgModule({
  declarations: [LinkContainerComponent],
  imports: [
    CommonModule,
    SymptomLinksRoutingModule
  ]
})
export class SymptomLinksModule { }
