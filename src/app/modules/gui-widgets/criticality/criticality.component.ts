import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  forwardRef,
  SimpleChanges
} from "@angular/core";
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormControl,
  Validators
} from "@angular/forms";
import { Subscription } from "rxjs";
import * as _ from "lodash";

@Component({
  selector: "mica-criticality",
  templateUrl: "./criticality.component.html",
  styleUrls: ["./criticality.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CriticalityComponent),
      multi: true
    }
  ]
})
export class CriticalityComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() max: number;
  values: number[];
  value: FormControl;
  private requiredInputs = ["max"];
  private valueSub: Subscription;
  propagateChange = (_: any) => {};
  registerOnChange(fn: (_: any) => {}) { this.propagateChange = fn; }
  registerOnTouched() {}

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    _.each(this.requiredInputs, ri => {
      if (!_.get(this, ri)) throw Error("CriticalityComponent required: " + ri);
    });
    this.values = _.map(Array(this.max), (n, i) => ++i);
    this.value = new FormControl("", Validators.required);
    this.valueSub = this.value.valueChanges.subscribe(v => {
      this.propagateChange(v);
      this.cd.detectChanges();
    });
  }

  ngOnDestroy() {
    this.valueSub.unsubscribe();
  }

  writeValue(value: string | number) {
    if (value !== undefined) {
      this.value.setValue(value);
    }
  }

}
