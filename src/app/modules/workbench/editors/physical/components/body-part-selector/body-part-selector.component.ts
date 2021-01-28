import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  forwardRef
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from "@angular/forms";
import * as _ from "lodash";

@Component({
  selector: "workbench-body-part-selector",
  templateUrl: "./body-part-selector.component.html",
  styleUrls: ["./body-part-selector.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BodyPartSelectorComponent),
      multi: true
    }
  ]
})
export class BodyPartSelectorComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() bodyPartsAll: string[];

  ctrl = new FormControl([]);

  private ctrlSub = this.ctrl.valueChanges.subscribe(v => {
    this.propagateChange(v);
    this.cd.detectChanges(); // here in case value is updated from outside
  });

  constructor(private cd: ChangeDetectorRef) { }

  // VALUE_ACCESSOR methods >>>>>
  propagateChange = (_: any) => {};

  registerOnChange(fn: (_: any) => {}) {
    this.propagateChange = fn;
  }

  registerOnTouched() {}

  writeValue(value: string[]) {
    if (!_.isUndefined(value) && !_.isNull(value)) this.ctrl.setValue(value);
  }
  // <<<<< VALUE_ACCESSOR methods

  ngOnInit() {
  }

  ngOnDestroy() {
    this.ctrlSub.unsubscribe();
  }

  onBodyPartRemove(part: string) {
    this.ctrl.setValue(_.without(this.ctrl.value, part));
  }

  sideRow(neededSide: "left" | "right", index: number) {
    return this.filterParts(neededSide).splice(index, 2);
  }

  partIsActive(part: string) {
    return !!~_.indexOf(this.ctrl.value, part);
  }

  partTrimmed(part: string) {
    const [side, name] = _.split(part, " ");

    return name;
  }

  private filterParts(neededSide: "left" | "right") {
    return _.reduce(this.bodyPartsAll, (parts, p: string) => {
        const [side, name] = _.split(p, " ");

        return side.toLowerCase() === neededSide ? [...parts, p] : parts;
      }, [] as string[]);
  }

}
