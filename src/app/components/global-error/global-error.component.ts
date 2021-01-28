import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "mica-global-error",
  templateUrl: "./global-error.component.html",
  styleUrls: ["./global-error.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalErrorComponent implements OnInit {
  globalError: string;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.globalError = this.route.snapshot.queryParams["msg"];
  }

}
