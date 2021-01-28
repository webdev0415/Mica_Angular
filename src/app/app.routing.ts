import { ReviewerGuard } from './modules/guards/reviewer.guard';
import { Routes } from '@angular/router';
import { BootstrapGuard } from './modules/guards/bootstrap.guard';
import { MainGuard } from './modules/guards/main.guard';
import { LogoutComponent } from './components/logout/logout.component';
import { BootstrapperComponent } from './components/bootstrapper/bootstrapper.component';
import { GlobalErrorComponent } from './components/global-error/global-error.component';
import { AppChooserComponent } from './components/app-chooser/app-chooser.component';

export const appRoutes: Routes = [
  { path: '',
    component: AppChooserComponent,
    data: { title: 'Choose App' },
    canActivate: [MainGuard]
  },
  { path: 'mica',
    loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule),
    data: { title: 'Task List' },
    canActivate: [MainGuard]
  },
  { path: 'symptom-links',
    loadChildren: () => import('./modules/symptom-links/symptom-links.module').then(m => m.SymptomLinksModule),
    canActivate: [MainGuard]
  },
  {
    path: 'logout',
    component: LogoutComponent,
    data: {
      title: 'Logout',
      message: 'You are now logged out.'
    }
  },
  {
    path: 'inactive',
    component: LogoutComponent,
    data: {
      title: 'You\'ve been logged out',
      message: 'You\'ve been logged out after a period of inactivity.'
    }
  },
  {
    path: 'bootstrap',
    component: BootstrapperComponent,
    data: {title: 'App Bootstrap'},
    canActivate: [BootstrapGuard]
  },
  {
    path: 'error',
    component: GlobalErrorComponent,
    data: {title: 'Error'},
    canActivate: [MainGuard]
  },
  {
    path: 'workbench',
    loadChildren: () => import('./modules/workbench/workbench.module').then(m => m.WorkbenchModule),
    canActivate: [MainGuard]
  },
  {
    path: 'review',
    loadChildren: () => import('./modules/review/review.module').then(m => m.ReviewModule),
    canActivate: [MainGuard]
  },
  {
    path: 'templates',
    loadChildren: () => import('./modules/symptom-template/symptom-template.module').then(m => m.SymptomTemplateModule),
    canActivate: [MainGuard, ReviewerGuard]
  },
  {
    path: 'treatments',
    loadChildren: () => import('./modules/treatments/treatments.module').then(m => m.TreatmentsModule),
    canActivate: [MainGuard, ReviewerGuard]
  },
  {
    path: 'symptoms',
    redirectTo: 'workbench/general',
    canActivate: [MainGuard, ReviewerGuard]
  },
  {
    path: 'create-symtom',
    redirectTo: 'workbench/create-symptom',
    canActivate: [MainGuard]
  },
  {
    path: 'ecw-reviews',
    loadChildren: () => import('./modules/ecw-reviews/ecw-reviews.module').then(m => m.EcwReviewsModule),
    canActivate: [MainGuard, ReviewerGuard]
  },
  {
    path: 'approved-illnesses',
    loadChildren: () => import('./modules/approved-illnesses/approved-illnesses.module').then(m => m.ApprovedIllnessesModule),
    canActivate: [MainGuard]
  },
  {
    path: 'groups',
    loadChildren: () => import('./modules/groups/groups.module').then(m => m.GroupsModule),
    canActivate: [MainGuard, ReviewerGuard]
  },

  // {path: "404", redirectTo: ""},
  // {path: "**", redirectTo: "" }
];
