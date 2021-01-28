import { Component, OnInit, AfterViewInit, OnChanges, ChangeDetectionStrategy, HostBinding, Input,
  Output, EventEmitter, TemplateRef, ElementRef, HostListener, SimpleChanges, ChangeDetectorRef } from "@angular/core";

export interface DropdownContext  {
  items: MICA.SelectableEl[];
  emitter: EventEmitter<MICA.SelectableEl>;
}

@Component({
  selector: "mica-typeahead-dropdown",
  exportAs: "micaTypeaheadDropdown",
  styleUrls: ["./dropdown.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./dropdown.component.html"
})
export class DropdownComponent implements OnInit, AfterViewInit, OnChanges {
  @HostBinding("class") className = "dropdown-menu d-block";
  @HostBinding("attr.role") role = "listbox";
  @Output() optionSelect: EventEmitter<MICA.SelectableEl> = new EventEmitter;
  @Output() outOfFocus: EventEmitter<boolean> = new EventEmitter;
  @Input() @HostBinding("id") id = "typeahead-dropdown";
  @Input() @HostBinding("attr.aria-labelledby") labelledBy = "typeahead-dropdown";
  @Input() items: MICA.SelectableEl[];
  @Input() templateRef: TemplateRef<DropdownContext>;
  @Input() align: "right" | "left" = "left";
  @Input() searchInput: HTMLElement;
  private activeIdx = 0;
  @Input() formatter: (s: MICA.SelectableEl) => string = s => s.value;
  private get btnEls(): HTMLButtonElement[] { return this.el.nativeElement.querySelectorAll(".dropdown-item"); }
  keepFocus: Boolean = false;

  constructor(private el: ElementRef, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.className = this.align === "left" ? this.className : this.className.concat(" dropdown-menu-right");
  }

  ngAfterViewInit() {
    this.btnEls[this.activeIdx].focus();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["items"].currentValue && changes["items"].previousValue) {
      this.cd.detectChanges();
      this.btnEls[0].focus();
    }
  }

  @HostListener("keydown.Esc", ["$event"])
  private esc(ev: KeyboardEvent) {
    this.outOfFocus.emit(true);
  }

  @HostListener("keydown.ArrowDown", ["$event"])
  private next(ev: KeyboardEvent) {
    ev.preventDefault();
    this.activeIdx++;
    if (this.activeIdx >= this.btnEls.length) {
      this.activeIdx = 0;
    }
    this.keepFocus = true;
    this.btnEls[this.activeIdx].focus();
    this.keepFocus = false;
  }

  @HostListener("keydown.ArrowUp", ["$event"])
  private prev(ev: KeyboardEvent) {
    ev.preventDefault();
    this.activeIdx--;
    if (this.activeIdx < 0) {
      this.activeIdx = this.btnEls.length - 1;
    }
    this.keepFocus = true;
    this.btnEls[this.activeIdx].focus();
    this.keepFocus= false;
  }

  onMouseOver(index: number) {
    this.keepFocus = true;
    if (index === this.activeIdx) {
      return;
    }
    this.activeIdx = index;
    this.btnEls[this.activeIdx].focus();
  }

  onBlur() {
    if (this.keepFocus) {
      return;
    }
    this.outOfFocus.emit(true);
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: Event) {
    if (!this.el.nativeElement.contains(event.target) && !this.searchInput.contains(event.target as any)) {
      this.outOfFocus.emit(true);
    }
  }

}
