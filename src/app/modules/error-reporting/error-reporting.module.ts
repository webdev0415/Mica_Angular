import { PipesModule } from "./../pipes/pipes.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ErrorBoxComponent } from "./box/box.component";
import { IllnessValueComponent } from "./illness-value/illness-value.component";
import { RowPropertyErrorPipe } from "./pipes/rowError.pipe";
import { IllnessErrorCounterComponent } from "./illness-error-counter/illness-error-counter.component";

@NgModule({
  imports: [
    CommonModule,
    PipesModule
  ],
  declarations: [
    ErrorBoxComponent,
    IllnessValueComponent,
    RowPropertyErrorPipe,
    IllnessErrorCounterComponent
  ],
  providers: [
    RowPropertyErrorPipe
  ],
  exports: [
    ErrorBoxComponent,
    IllnessValueComponent,
    IllnessErrorCounterComponent
  ]
})
export class ErrorReportingModule { }
