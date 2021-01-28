import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  forwardRef, ElementRef
} from "@angular/core";
import {
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  FormControl,
  Validators
} from "@angular/forms";
import * as _ from "lodash";

@Component({
  selector: "mica-dropdown",
  styleUrls: ["./dropdown.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true
    }, {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true
    }
  ],
  templateUrl: "./dropdown.component.html"
})
export class DropdownComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() title: string;
  @Input() items: MICA.SelectableEl[];
  @Input() excludeItems: string[][] = [];
  @Input() size: "" | "sm" = "";
  @Input() placeholder = "Not Set";
  @Input() multiSelect = false;
  @Input() controlDisabled = false;
  @Input() emptyItem: MICA.SelectableEl;
  @Input() formControl: FormControl;
  ctrl: FormControl = new FormControl("");
  isActive = false;
  sortedBy = "name";
  // keep func for Event Listeners
  listenerFunc: any;

  get dropdownToggleClass() {
    return this.size ? `btn-${this.size}` : ""
  }

  get valueName() {
    const match = this.selectables.find(el => el.value === this.ctrl.value);
    return match !== undefined ? match.name : this.ctrl.value;
  }

  get selectedItems() {
    const values = this.ctrl.value ? this.ctrl.value.split(",") : [];

    return values.reduce((res: string[], val: any) => {
      const item = this.selectables.find(el => el.value === val);

      if (item) {
        res.push(item.name || item.value);
      } else {
        res.push(val);
      }

      return res;
    }, []).join(", ");
  }

  private valueSub = this.ctrl.valueChanges.subscribe(v => this.propagateChange(v));
  propagateChange = (_: any) => {
  };

  registerOnChange(fn: (_: any) => {}) {
    this.propagateChange = fn;
  }

  registerOnTouched() {
    if (this.ctrl.errors) this.ctrl.updateValueAndValidity()
  }

  writeValue(value: string | number) {
    if (value !== undefined) this.ctrl.setValue(value);
  }

  validate(c: FormControl) {
    return this.ctrl.errors
  }

  constructor(private elementRef: ElementRef,
              private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    const validations = this.formControl ? this.formControl.validator : [];
    this.ctrl.setValidators(validations);
  }

  ngOnDestroy() {
    this.valueSub.unsubscribe();
    document.removeEventListener("click", this.listenerFunc);
  }

  // @HostListener('document:click', ['$event'])
  // HostListener has an bug that trigger detectChanges on the entire element tree.

  closeDropdown(e: Event) {
    if (!this.elementRef.nativeElement.contains(e.target) && this.isActive) {
      document.removeEventListener("click", this.listenerFunc);
      this.isActive = false;
      this.cd.detectChanges();
    }
  }

  showDropdown() {
    if (this.controlDisabled)
      return;
    this.isActive = !this.isActive;
    if (this.isActive) {
      this.listenerFunc = this.closeDropdown.bind(this);
      document.addEventListener("click", this.listenerFunc)
    } else {
      document.removeEventListener("click", this.listenerFunc);
    }
  }

  toggleValue() {
    this.ctrl.setValue(!this.ctrl.value);
  }

  get selectables(): MICA.SelectableEl[] {
    return _.map(this.items, (i, index) => {
      if (i.displayOrder) {
        this.sortedBy = "displayOrder";
      } else {
        this.sortedBy = "name";
      }
      return {
        name: i.name,
        value: i.value || i.name,
        displayOrder: i.displayOrder || index
      };
    })
  }

  get dropdownItems(): MICA.SelectableEl[] {
    return _.chain(this.selectables)
      .filter(item => {
        return !_.some(_.flatten(this.excludeItems), exclude => {
          return (
            this.multiSelect ?
              this.ctrl.value.split(",").indexOf(exclude) < 0 :
              exclude !== this.ctrl.value) && exclude === (item.value || item.name);
        });
      })
      .sortBy(this.sortedBy)
      .value();
  }

  onValueClick(evt: Event, value: string) {
    if (this.dropdownItems.length > 1) {
      evt.stopPropagation();
    }

    const currentValueArr = this.ctrl.value.split(",");

    if (!currentValueArr[0] || currentValueArr[0] === "null") {
      currentValueArr.shift();
    }

    const foundIndex = currentValueArr.findIndex((currValue: string) => currValue === value.toString());

    if (foundIndex > -1) {
      currentValueArr.splice(foundIndex, 1);
    } else {
      currentValueArr.push(value);
    }

    currentValueArr.sort();

    if (!currentValueArr.length) {
      this.ctrl.setValue("");
    } else {
      this.ctrl.setValue(currentValueArr.join(","));
    }
  }

  valueSelected(valueToCheck: string) {
    return this.ctrl.value.split(",").findIndex((val: string) => val === valueToCheck) > -1;
  }
}
