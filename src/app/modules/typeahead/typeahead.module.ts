import { ReactiveFormsModule } from "@angular/forms";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TypeaheadComponent } from "./typeahead.component";
import { ApiService } from "./api.service";
import { DropdownComponent } from './dropdown/dropdown.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  providers: [ApiService],
  declarations: [TypeaheadComponent, DropdownComponent],
  exports: [TypeaheadComponent]
})
export class TypeaheadModule { }
