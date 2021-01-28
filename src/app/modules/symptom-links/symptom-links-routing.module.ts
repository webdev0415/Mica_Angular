import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LinkContainerComponent } from "./link-container/link-container.component";


const routes: Routes = [{
  path: '', component: LinkContainerComponent,
  data: {title: 'Symptom Links'}
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SymptomLinksRoutingModule { }
