import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import {pageSizes} from "../../app.config";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: "mica-approved-illnesses",
  templateUrl: "./approved-illnesses.component.html",
  styleUrls: ["./approved-illnesses.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApprovedIllnessesComponent implements OnInit {
  rows = [];


  constructor() { }

  ngOnInit() {
  }



}
