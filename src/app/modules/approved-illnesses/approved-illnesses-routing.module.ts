import { NgModule } from "@angular/core";
import {RouterModule, Routes} from "@angular/router";

import {ApprovedIllnessesComponent} from "./approved-illnesses.component";

const routes: Routes = [
  {
    path: "",
    component: ApprovedIllnessesComponent,
    data: {title: "Approved Illnesses"}
    // path: "",
    // redirectTo: "approved-illnesses",
    // pathMatch: "full",
    // children: [{
    //   path: "approved-illnesses",
    //   component: ApprovedIllnessesComponent
    // }]
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ApprovedIllnessesRoutingModule { }
