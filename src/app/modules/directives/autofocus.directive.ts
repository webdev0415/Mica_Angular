import {
  Directive,
  ElementRef,
  OnInit,
} from "@angular/core";

@Directive({
  selector: "[mica-autofocus]"
})
export class AutofocusDirective implements OnInit {

  constructor(public elementRef: ElementRef) {}

  ngOnInit() {
      this.elementRef.nativeElement.focus();
  }

}
