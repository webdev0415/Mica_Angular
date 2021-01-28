import { ReviewerGuard } from "../guards/reviewer.guard";
import { InspectorComponent } from "./components/inspector/inspector.component";
import { RouteResolverService } from "./services/route-resolver.service";
import { ReviewEditorComponent } from "./components/editor/editor.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [
  {
    path: "",
    redirectTo: "editor",
    pathMatch: "full"
  }, {
    path: "editor",
    component: ReviewEditorComponent,
    data: {
      title: "Review",
      hasSection: true
    },
    resolve: {
      "": RouteResolverService
    }
  }, {
    path: "inspector",
    component: InspectorComponent,
    data: {
      title: "Inspector",
      hasSection: false
    },
    canActivate: [ReviewerGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReviewRoutingModule {}
