import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "review-syncing-btn",
  templateUrl: "./syncing-btn.component.html",
  styleUrls: ["./syncing-btn.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SyncingBtnComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
