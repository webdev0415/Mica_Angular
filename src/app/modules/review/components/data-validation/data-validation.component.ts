import { Component, OnInit, ChangeDetectionStrategy, Input } from "@angular/core";

@Component({
  selector: "reviewer-data-validation",
  templateUrl: "./data-validation.component.html",
  styleUrls: ["./data-validation.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataValidationComponent implements OnInit {
  @Input() message: string;

  constructor() { }

  ngOnInit() {

  }

}
