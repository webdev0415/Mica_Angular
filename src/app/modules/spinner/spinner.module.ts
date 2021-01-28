import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { InlineSpinnerComponent } from "./inline-spinner/inline-spinner.component";
import { PageSpinnerComponent } from "./page-spinner/page-spinner.component";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    InlineSpinnerComponent,
    PageSpinnerComponent
  ],
  exports: [
    InlineSpinnerComponent,
    PageSpinnerComponent
  ]
})
export class SpinnerModule { }
