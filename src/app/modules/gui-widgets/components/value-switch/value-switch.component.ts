import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  forwardRef
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import * as _ from "lodash";

@Component({
  selector: "mica-value-switch",
  templateUrl: "./value-switch.component.html",
  styleUrls: ["./value-switch.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ValueSwitchComponent),
      multi: true
    }
  ]
})
export class ValueSwitchComponent implements OnInit, ControlValueAccessor {
  @Input() values: [string|number, string|number];
  @Input() title = "";
  @Input() size: "" | "sm" | "lg" = "";
  private requiredInputs = ["values"];
  private _value: string | number;
  get value() { return this._value; }
  set value(v: string | number) {
    this._value = v;
    this.propagateChange(v);
  }
  propagateChange = (_: any) => {};
  registerOnChange(fn: (_: any) => {}) { this.propagateChange = fn; }
  registerOnTouched() {}
  get togglePosition(): string {
    const width = 100 / this.values.length;
    const index = _.indexOf(this.values, this.value);
    return (index * width) + "%";
  }

  constructor() { }

  ngOnInit() {
    _.each(this.requiredInputs, ri => {
      if (!_.get(this, ri)) throw Error("ValueSwitchComponent required: " + ri);
    });
  }

  writeValue(value: string | number) {
    if (value !== undefined) {
      this.value = value;
    }
  }


}
