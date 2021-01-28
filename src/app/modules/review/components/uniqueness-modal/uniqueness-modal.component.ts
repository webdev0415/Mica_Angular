import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Component, OnInit, ChangeDetectionStrategy, Input } from "@angular/core";
import * as _ from "lodash";

@Component({
  selector: "mica-uniqueness-modal",
  templateUrl: "./uniqueness-modal.component.html",
  styleUrls: ["./uniqueness-modal.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniquenessModalComponent implements OnInit {
  @Input() idIcd10Code: string;
  @Input() name: string;
  @Input() illnesses: string[];
  colIndexes = [0, 1, 2, 3];
  cols: Array<string[]>;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {
    const split = Math.round(this.illnesses.length / 4);
    this.cols = [
      this.illnesses.slice(0, split),
      this.illnesses.slice(split, split * 2),
      this.illnesses.slice(split * 2, split * 3),
      this.illnesses.slice(split * 3)
    ];
  }

}
