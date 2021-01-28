import { WorkbenchPainLayoutComponent } from "./components/layout/layout.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [{
  path: "",
  component: WorkbenchPainLayoutComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PainRoutingModule { }
