import {Directive, HostListener} from "@angular/core";

@Directive({
    selector: "[micaStopPropagation]"
})
export class StopPropagationDirective {

  @HostListener("click", ["$event"])
  @HostListener("keydown.enter", ["$event"])
  public onClick(event: Event): void {
    event.stopPropagation();
  }
}
