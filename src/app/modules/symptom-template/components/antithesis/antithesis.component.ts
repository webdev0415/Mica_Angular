import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  SimpleChanges
} from "@angular/core";
import {
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  FormControl,
  ValidatorFn,
  Validators
} from "@angular/forms";
import { Subscription } from "rxjs";
import * as _ from "lodash";
import { minMax } from "../../../../util/forms/validators";

@Component({
  selector: "templates-antithesis",
  templateUrl: "./antithesis.component.html",
  styleUrls: ["./antithesis.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AntithesisComponent),
      multi: true
    }, {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AntithesisComponent),
      multi: true
    }
  ]
})
export class AntithesisComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() minMaxRange: [number, number];
  @Output() close: EventEmitter<boolean> = new EventEmitter();
  value: FormControl;
  initValue: number;
  private validateFn: ValidatorFn;
  private requiredInputs = ["minMaxRange"];
  private valueSub: Subscription;
  propagateChange = (_: any) => {};
  registerOnChange(fn: (_: any) => {}) { this.propagateChange = fn; }
  registerOnTouched() {}

  constructor() { }

  ngOnInit() {
    _.each(this.requiredInputs, ri => {
      if (!_.get(this, ri)) throw Error("AntithesisComponent required: " + ri);
    });
    this.validateFn = minMax(this.minMaxRange[0], this.minMaxRange[1]);
    this.value = new FormControl("", this.validateFn);
    this.valueSub = this.value.valueChanges.subscribe(v => this.propagateChange(v));
  }

  ngOnDestroy() {
    if (this.value.invalid) {
      this.value.setValue(this.initValue);
    }
    this.valueSub.unsubscribe();
  }

  validate(c: FormControl) {
    return this.validateFn(c) && Validators.required(c);
  }

  writeValue(value: string | number) {
        this.initValue = +value;
    if (value !== undefined) {
      this.value.setValue(value);
    }
  }

}
