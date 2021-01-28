import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input
} from "@angular/core";

@Component({
  selector: "mica-page-spinner",
  templateUrl: "./page-spinner.component.html",
  styleUrls: ["./page-spinner.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageSpinnerComponent implements OnInit {
  @Input() message = "Loading...";

  constructor() { }

  ngOnInit() {
  }

}
