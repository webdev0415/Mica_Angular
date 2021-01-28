import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  forwardRef
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import * as _ from "lodash";

@Component({
  selector: "mica-check-switch",
  templateUrl: "./check-switch.component.html",
  styleUrls: ["./check-switch.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckSwitchComponent),
      multi: true
    }
  ]
})
export class CheckSwitchComponent implements OnInit, ControlValueAccessor {
  @Input() valueNames: [string, string];
  @Input() title = "";
  @Input() size: "" | "sm" | "lg" = "";
  private requiredInputs = ["valueNames"];
  private _value: boolean;
  get value() { return this._value; }
  set value(v: boolean) {
    this._value = v;
    this.propagateChange(v);
    this.cd.detectChanges();
  }
  propagateChange = (_: any) => {};
  registerOnChange(fn: (_: any) => {}) { this.propagateChange = fn; }
  registerOnTouched() {}
  get togglePosition(): {[prop: string]: any} {
    return {
      left: this.value ? "calc(100% - 26px)" : "0"
    }
  }

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    _.each(this.requiredInputs, ri => {
      if (!_.get(this, ri)) throw Error("CheckSwitchComponent required: " + ri);
    });
  }

  writeValue(value: boolean) {
    value = value || false;
    if (!_.isBoolean(value)) throw Error("CheckSwitchComponent only accepts checkbox type values");
    this.value = value;
  }


}
