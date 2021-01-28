import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";

@Component({
  selector: "mica-multiplier-loader",
  templateUrl: "./loader.component.html",
  styleUrls: ["./loader.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiplierLoaderComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
