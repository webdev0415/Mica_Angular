import { ErrorFinderComponent } from "./components/error-finder/error-finder.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { EditorComponent } from "./components/editor/editor.component";

const routes: Routes = [{
    path: "",
    redirectTo: "editor",
    pathMatch: "full"
  }, {
    path: "editor",
    component: EditorComponent,
    data: {title: "Symptom Templates"}
  }, {
    path: "errors",
    component: ErrorFinderComponent,
    data: {title: "Errors in Templates"}
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SymptomTemplateRoutingModule { }
