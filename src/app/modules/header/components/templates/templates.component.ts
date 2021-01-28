import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "header-templates",
  templateUrl: "./templates.component.html",
  styleUrls: ["./templates.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplatesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
