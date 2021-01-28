import { Component, OnInit, ChangeDetectionStrategy, Input } from "@angular/core";

@Component({
  selector: "mica-inline-spinner",
  templateUrl: "./inline-spinner.component.html",
  styleUrls: ["./inline-spinner.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InlineSpinnerComponent implements OnInit {
  @Input() size: string;

  constructor() { }

  ngOnInit() {
  }

}
