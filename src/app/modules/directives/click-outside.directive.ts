import { Directive, OnInit, OnDestroy, Output, ElementRef, EventEmitter } from "@angular/core";

@Directive({
  selector: "[micaClickOutside]"
})
export class ClickOutsideDirective implements OnInit, OnDestroy {
  @Output() micaClickOutside = new EventEmitter();
  listenerFunc: any;

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.listenerFunc = this.clickHandler.bind(this);
    document.addEventListener("click", this.listenerFunc);
  }

  clickHandler(e: Event) {
    if (!this.elementRef.nativeElement.contains(e.target)) {
      this.micaClickOutside.emit(true);
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener("click", this.listenerFunc)
  }

}
