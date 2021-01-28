import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy, Input, Output, EventEmitter,
  ChangeDetectorRef, forwardRef, OnDestroy, ViewChild, ElementRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from "@angular/forms";
@Component({
  selector: "templates-array-input",
  templateUrl: "./input-array-value-edit.component.html",
  styleUrls: ["./input-array-value-edit.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputArrayValueEditComponent),
      multi: true
    }
  ]
})
export class InputArrayValueEditComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() title: string;
  @Input() type: string;
  @Input() validator: any;
  @Output() close: EventEmitter<boolean> = new EventEmitter();
  ctrl = new FormControl([]);
  showInput = false;

  private valueSub = this.ctrl.valueChanges.subscribe(v => {
    this.propagateChange(v);
    this.cd.detectChanges(); // here in case value is updated from outside
  });

  propagateChange = (_: any) => {};
  registerOnChange(fn: (_: any) => {}) { this.propagateChange = fn }
  registerOnTouched() { }
  writeValue(value: number[] | string[]) {
    if (value) {
      this.ctrl.setValue(value);
    }
  }

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    if (this.validator) this.ctrl.setValidators([this.validator]);
  }

  ngOnDestroy() {
    this.valueSub.unsubscribe();
  }

  toggleMode() {
      if (this.showInput) {
        this.showInput = false;
        this.cd.detectChanges();
      } else {
        this.showInput = true;
        this.cd.detectChanges();
      }
  }

  removeItem(index: number) {
    const items = this.ctrl.value;
    items.splice(index, 1)
    this.ctrl.setValue(items);
  }

  addItem(item: string | number) {
    if (item) {
      const items = [...this.ctrl.value, item];
      this.ctrl.setValue(items);
    }
    this.toggleMode();
  }

}
