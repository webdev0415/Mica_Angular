import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  forwardRef
} from "@angular/core";
import {
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  FormControl,
  Validators
} from "@angular/forms";
import { likelihoodValidator } from "./likelihood.validator";
import { isNullOrUndefined } from "util";

@Component({
  selector: "mica-likelihood",
  templateUrl: "./likelihood.component.html",
  styleUrls: ["./likelihood.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LikelihoodComponent),
      multi: true
    }, {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => LikelihoodComponent),
      multi: true
    }
  ]
})
export class LikelihoodComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() readOnly = false;
  @Input() compact = false;
  @Input() symptomData: Symptom.Data;

  ctrl = new FormControl("", [Validators.required, likelihoodValidator]);
  btnValues = [
    {
      name: "Rare",
      value: 2
    },
    {
      name: "S. Likely",
      value: 20
    },
    {
      name: "Likely",
      value: 40
    },
    {
      name: "V. Likely",
      value: 60
    },
    {
      name: "Definite",
      value: 80
    },
    {
      name: "Always",
      value: 98
    },
  ];

  private valueSub = this.ctrl.valueChanges.subscribe(v => {
    this.propagateChange(v);
    this.cd.detectChanges(); // here in case value is updated from outside
  });

  propagateChange = (_: any) => {};
  registerOnChange(fn: (_: any) => {}) { this.propagateChange = fn }
  registerOnTouched() { if (this.ctrl.errors) this.ctrl.updateValueAndValidity() }
  writeValue(value: string | number) {if (value !== undefined) this.ctrl.setValue(value) }
  validate(c: FormControl) { return this.ctrl.errors }

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.valueSub.unsubscribe();
  }

  likelihoodValue(v: any) {
    this.ctrl.setValue(v);
  }

  get btnType(): string {
    return this.ctrl.valid ? "btn-primary" : "btn-warning";
  }

}
