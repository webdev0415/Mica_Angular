import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { NgRedux, select } from "@angular-redux/store";
import { Observable } from "rxjs/Observable";
import { activeIllnessID } from "./../../../../state/workbench/workbench.selectors";
@Component({
  selector: "header-ecw-reviews",
  templateUrl: "./ecw-reviews.component.html",
  styleUrls: ["./ecw-reviews.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EcwReviewsComponent implements OnInit {
  @select(["ecw", "active", "icd10Code"]) icd10Code$: Observable<string>;
  @select(activeIllnessID) activeIllnessCode$: Observable<string>;

  constructor( private s: NgRedux<State.Root>) { }

  ngOnInit() {
  }

}
