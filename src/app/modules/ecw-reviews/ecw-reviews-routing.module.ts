import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { EcwReviewsPageComponent } from "./components/ecw-reviews-page/ecw-reviews-page.component";
import { EcwEditorComponent } from "./components/ecw-editor/ecw-editor.component";

import { ReviewerGuard } from "../guards/reviewer.guard";

const routes: Routes = [{
    path: "", component: EcwReviewsPageComponent,
    data: {title: "ECW Reviews"}
  }, {
    path: "editor/review", component: EcwEditorComponent,
    data: {title: "ECW Review"}
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [ReviewerGuard],
  exports: [RouterModule]
})
export class EcwReviewsRoutingModule {

}
