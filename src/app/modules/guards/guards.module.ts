import { MainGuard } from "./main.guard";
import { ReviewerGuard } from "./reviewer.guard";
import { BootstrapGuard } from "./bootstrap.guard";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    BootstrapGuard,
    ReviewerGuard,
    MainGuard
  ]
})
export class GuardsModule { }
