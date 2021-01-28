import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IconComponent } from "./icon/icon.component";
import { NgbPopoverModule } from "@ng-bootstrap/ng-bootstrap";
import { ValidationService } from './validation.service';

@NgModule({
  imports: [
    CommonModule,
    NgbPopoverModule
  ],
  declarations: [IconComponent],
  exports: [IconComponent],
  providers: [ValidationService]
})
export class ValidationModule { }
