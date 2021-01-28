import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GroupsComponent } from './groups/groups.component';

const routes: Routes = [{
  path: "", component: GroupsComponent,
  data: {title: 'Groups View'}
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupsRoutingModule { }
