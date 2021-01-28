import {Directive, HostListener} from "@angular/core";

@Directive({
    selector: "[micaPreventDefault]"
})
export class PreventDefaultDirective {

  @HostListener("click", ["$event"])
  public onClick(event: Event): void {
    event.preventDefault();
  }
}
