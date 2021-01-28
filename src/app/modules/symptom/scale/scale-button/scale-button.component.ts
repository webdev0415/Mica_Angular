import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from "@angular/core";
import { TimeRange } from "../../../../util/data/illness";

@Component({
  selector: "mica-scale-button",
  templateUrl: "./scale-button.component.html",
  styleUrls: ["./scale-button.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScaleButtonComponent implements OnInit {
  @Input() isAvailable = true;
  @Input() isSelected: boolean;
  @Input() isInvalid: boolean;
  @Input() isDisabled: boolean;
  @Input() tooltip: string;
  @Input() range: TimeRange;
  @Output() toggleRange: EventEmitter<void> = new EventEmitter();

  constructor() {
  }

  get btnClass(): string {
    if (this.isSelected) {
      return "btn-success";
    }

    if (!this.isAvailable) {
      return "btn-secondary";
    }

    if (this.isInvalid) {
      return "btn-warning";
    }

    return "btn-primary";
  }

  onClick() {
    this.toggleRange.next();
  }

  transformRangeName(name: string) {
    if (name === "Less than 1 Day") {
      return "< 1 Day"
    }
    if (name === "Less than 1 Week") {
      return "< 1 Week"
    }
    if (name === "Less than 1 Month") {
      return "< 1 Month"
    }
    return name;
  }


  ngOnInit() {
  }

}
