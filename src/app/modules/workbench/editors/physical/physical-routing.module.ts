import { WorkbenchPhysicalLayoutComponent } from "./components/layout/layout.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [{
  path: "",
  component: WorkbenchPhysicalLayoutComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PhysicalRoutingModule { }
