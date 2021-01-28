import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter, ChangeDetectorRef,
} from "@angular/core";
import {
  FormControl,
  FormArray,
  FormGroup
} from "@angular/forms";
import { Subscription } from "rxjs";
import * as _ from "lodash";

@Component({
  selector: "templates-snomed-codes",
  templateUrl: "./snomed-codes.component.html",
  styleUrls: ["./snomed-codes.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: []
})
export class SnomedCodesComponent implements OnInit, OnDestroy {
  @Input() ctrl: FormArray = new FormArray([]);
  @Input() title: string;
  @Output() close: EventEmitter<boolean> = new EventEmitter();

  valueSub: Subscription;
  editable = -1;
  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {

    if (this.ctrl.controls.length) {
      this.ctrl.controls.forEach((fg: FormGroup) => {
        if (!fg.get("snomedCodes") || fg.get("snomedCodes") instanceof FormArray) {
          fg.setControl("snomedCodes", new FormControl([]))
        }
        if (!fg.get("snomedName"))
          fg.addControl("snomedName", new FormControl(""))
      })
    } else {
      this.addSnomedRow();
    }
  }

  ngOnDestroy() {

  }

  addSnomedRow() {
    const snomedCodes = new FormControl([]);
    const snomedName = new FormControl("");
    this.ctrl.push(new FormGroup({snomedCodes, snomedName}));
  }

  removeRow(index: number) {
    this.ctrl.removeAt(index);
    this.ctrl.markAsDirty();
  }

}
