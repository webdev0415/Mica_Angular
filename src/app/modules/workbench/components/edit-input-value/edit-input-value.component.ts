import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy, Input, Output, EventEmitter,
  ChangeDetectorRef, forwardRef, OnDestroy, ViewChild, ElementRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from "@angular/forms";
@Component({
  selector: "edit-input",
  templateUrl: "./edit-input-value.component.html",
  styleUrls: ["./edit-input-value.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditInputValueComponent),
      multi: true
    }
  ]
})
export class EditInputValueComponent implements OnInit, OnDestroy, AfterViewInit, ControlValueAccessor {
  @Input() title: string;
  @Input() validator: any;
  @Output() close: EventEmitter<boolean> = new EventEmitter();
  @ViewChild("inputEl", {static: false}) inputEl: ElementRef;
  ctrl = new FormControl("");
  private valueSub = this.ctrl.valueChanges.subscribe(v => {
    this.propagateChange(v);
    this.cd.detectChanges(); // here in case value is updated from outside
  });
  propagateChange = (_: any) => {};
  registerOnChange(fn: (_: any) => {}) { this.propagateChange = fn }
  registerOnTouched() { }
  writeValue(value: string) {
    if (value !== undefined) {
      this.ctrl.setValue(value);
      this.inputEl.nativeElement.focus();
    }
  }

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    if (this.validator) this.ctrl.setValidators([this.validator]);
  }

  ngAfterViewInit() {
    this.inputEl.nativeElement.focus();
  }

  ngOnDestroy() {
    this.valueSub.unsubscribe();
  }

}
