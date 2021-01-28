import { RouteResolverService } from './services/route-resolver.service';
import { IllnessSelectComponent } from './components/illness-select/illness-select.component';
import { WorkbenchMainComponent } from './components/main/main.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateSymptomComponent } from './components/create-symptom/create-symptom.component';
import { EditSymptomComponent } from './components/edit-symptom/edit-symptom.component';

const routes: Routes = [{
  path: '',
  component: WorkbenchMainComponent,
  data: { title: 'Workbench', hasSection: true },
  children: [
    {
      path: 'select-illness',
      component: IllnessSelectComponent
    },
    {
      path: 'general',
      loadChildren: () => import('./editors/default/default.module').then(m => m.WorkbenchDefaultModule),
      resolve: {
        '': RouteResolverService,
      },
    },
    {
      path: 'behaviour',
      loadChildren: () => import('./editors/default/default.module').then(m => m.WorkbenchDefaultModule),
      resolve: {
        '': RouteResolverService,
      },
    },
    {
      path: 'neurological',
      loadChildren: () => import('./editors/default/default.module').then(m => m.WorkbenchDefaultModule),
      resolve: {
        '': RouteResolverService,
      },
    },
    {
      path: 'measurements',
      loadChildren: () => import('./editors/default/default.module').then(m => m.WorkbenchDefaultModule),
      resolve: {
        '': RouteResolverService,
      },
    },
    {
      path: 'labs',
      loadChildren: () => import('./editors/default/default.module').then(m => m.WorkbenchDefaultModule),
      resolve: {
        '': RouteResolverService,
      },
    },
    {
      path: 'nlp',
      loadChildren: () => import('./editors/default/default.module').then(m => m.WorkbenchDefaultModule),
      resolve: {
        '': RouteResolverService,
      },
    },
    {
      path: 'causes',
      loadChildren: () => import('./editors/default/default.module').then(m => m.WorkbenchDefaultModule),
      resolve: {
        '': RouteResolverService,
      },
    },
    {
      path: 'physical',
      loadChildren: () => import('./editors/physical/physical.module').then(m => m.WorkbenchPhysicalModule),
      resolve: {
        'shapes': RouteResolverService,
      },
    },
    {
      path: 'pain',
      loadChildren: () => import('./editors/pain/pain.module').then(m => m.WorkbenchPainModule),
      resolve: {
        'shapes': RouteResolverService,
      },
    },
    {
      path: 'triage',
      loadChildren: () => import('./editors/default/default.module').then(m => m.WorkbenchDefaultModule),
      resolve: {
        '': RouteResolverService,
      },
    },
    {
      path: 'create-symptom',
      component: CreateSymptomComponent
    },
    {
      path: 'edit-symptom',
      component: EditSymptomComponent
    },
    {
      path: 'edit-symptom/new-symptom',
      component: EditSymptomComponent
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkbenchRoutingModule { }
