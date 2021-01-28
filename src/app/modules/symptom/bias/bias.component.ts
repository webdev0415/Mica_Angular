import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
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
import * as _ from "lodash";

@Component({
  selector: "mica-bias",
  styleUrls: ["./bias.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BiasComponent),
      multi: true
    }, {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => BiasComponent),
      multi: true
    }
  ],
  templateUrl: "./bias.component.html"
})
export class BiasComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() readOnly = false;
  ctrl = new FormControl("", [Validators.required, Validators.pattern(/true|false/)]);
  private valueSub = this.ctrl.valueChanges.subscribe(v => this.propagateChange(v));
  propagateChange = (_: any) => {};
  registerOnChange(fn: (_: any) => {}) { this.propagateChange = fn; }
  registerOnTouched() {}

  ngOnInit() {
  }

  ngOnDestroy() {
    this.valueSub.unsubscribe();
  }

  validate(c: FormControl) {
    return this.ctrl.errors;
  }

  toggleValue() {
    if (this.readOnly)
      return;
    this.ctrl.setValue(!this.ctrl.value);
  }

  writeValue(value: string | number) {
    if (value !== undefined) {
      this.ctrl.setValue(value);
    }
  }

}
