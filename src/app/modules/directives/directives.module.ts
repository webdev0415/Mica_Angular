import { NgModule } from "@angular/core";
import { AutofocusDirective } from "./autofocus.directive";
import { PreventDefaultDirective } from "./prevent-default.directive";
import { StopPropagationDirective } from "./stop-propagation.directive";
import { InputTrimDirective } from "./input-trim.directive";
import { InputUppercaseDirective } from "./input-uppercase.directive";
import { ClickOutsideDirective } from "./click-outside.directive";

@NgModule({
  declarations: [
    AutofocusDirective,
    PreventDefaultDirective,
    StopPropagationDirective,
    InputTrimDirective,
    InputUppercaseDirective,
    ClickOutsideDirective,
  ],
  exports: [
    AutofocusDirective,
    PreventDefaultDirective,
    StopPropagationDirective,
    InputTrimDirective,
    InputUppercaseDirective,
    ClickOutsideDirective,
  ]
})
export class DirectivesModule { }
