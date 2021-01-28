import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReviewerGuard } from '../guards/reviewer.guard';
import { TreatmentsPageComponent } from './components/treatments-page/treatments-page.component';

const routes: Routes = [
  {
    path: '', component: TreatmentsPageComponent,
    data: { title: 'Treatments' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [ReviewerGuard],
  exports: [RouterModule]
})
export class TreatmentsRoutingModule { }
