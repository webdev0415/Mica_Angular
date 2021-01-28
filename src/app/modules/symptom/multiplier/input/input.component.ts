import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  OnDestroy,
  forwardRef
} from "@angular/core";
import {
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  FormControl,
  ValidatorFn,
  Validators
} from "@angular/forms";

@Component({
  selector: "symptom-multiplier-input",
  templateUrl: "./input.component.html",
  styleUrls: ["./input.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiplierInputComponent),
      multi: true
    }, {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MultiplierInputComponent),
      multi: true
    }
  ]
})
export class MultiplierInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() placeholder: string;
  @Input() value: string;
  @Input() inputType = "text";
  ctrl = new FormControl("", Validators.required);
  private valueSub = this.ctrl.valueChanges.subscribe(v => this.propagateChange(v));
  propagateChange = (_: any) => {};
  registerOnChange(fn: (_: any) => {}) { this.propagateChange = fn }
  registerOnTouched() { if (this.ctrl.errors) this.ctrl.updateValueAndValidity() }
  writeValue(value: string | number) {
    if (value !== undefined) {
      this.ctrl.setValue(value);
      // this.cd.detectChanges(); // for when body part is written in pain
    }
  }
  validate(c: FormControl) { return this.ctrl.errors }

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.valueSub.unsubscribe();
    this.cd.detach();
  }

  get validationClass(): string {
    return this.ctrl.valid ? "" : "has-warning";
  }

}
