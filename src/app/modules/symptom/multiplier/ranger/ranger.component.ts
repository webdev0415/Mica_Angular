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
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  FormControl,
  FormBuilder,
  FormGroup,
  Validators
} from "@angular/forms"; import { Subscription } from "rxjs";
import * as _ from "lodash";
import { rangeValidator } from "./ranger.validator";
import { minMax } from "../../../../util/forms/validators";
@Component({
  selector: "mica-ranger",
  templateUrl: "./ranger.component.html",
  styleUrls: ["./ranger.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RangerComponent),
      multi: true
    }, {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RangerComponent),
      multi: true
    }
  ]
})
export class RangerComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() readOnly = false;
  @Input() validRange: [number, number];
  @Input() value: [number, number];
  private subs: Subscription[] = [];
  private ctrl = new FormControl(["", ""]);
  private valueSub = this.ctrl.valueChanges.subscribe(v => this.propagateChange(v));
  values: FormGroup;
  timer: any;
  propagateChange = (_: any) => {};
  registerOnChange(fn: (_: any) => {}) { this.propagateChange = fn }
  registerOnTouched() { if (this.ctrl.errors) this.ctrl.updateValueAndValidity() }
  writeValue(v: any[]) {
    const min = this.values.get("min");
    const max = this.values.get("max");
    if (v !== undefined && v.length === 2 && _.every(v, _.isNumber)) {
      this.ctrl.setValue(v);
      if (!min || !max) return;
      min.setValue(v[0]);
      max.setValue(v[1]);
    } else if (v.length === 2 && _.every(v, _.isString)) {
      this.ctrl.setValue(this.castValue);
      if (!min || !max) return;
      min.setValue(+v[0]);
      max.setValue(+v[1]);
    }
  }
  validate(c: FormControl) { return this.ctrl.errors }

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.ctrl.setValidators(rangeValidator(this.validRange));
    this.values = this.fb.group({
      min: [this.ctrl.value[0] || this.validRange[0], minMax(this.validRange[0], this.validRange[1] - 0.1)],
      max: [this.ctrl.value[1] || this.validRange[1], minMax(this.validRange[0] + 0.1, this.validRange[1])]
    });
    this.subs.push(this.values.valueChanges.subscribe(v => this.ctrl.setValue([v.min, v.max])));
    this.values.updateValueAndValidity();
    this.timer = setTimeout(() => this.ctrl.updateValueAndValidity(), 1);

    if (this.readOnly)
      this.values.disable();
  }

  ngOnDestroy() {
    this.valueSub.unsubscribe();
    _.each(this.subs, s => s.unsubscribe());
    if (this.timer)
      clearTimeout(this.timer);
  }

  private castValue(v: any[]): [number, number] {
    if (!_.isArray(v) || v.length !== 2) throw Error("Invalid format for range value.");
    return _.map(v, _.toNumber) as [number, number];
  }

}
