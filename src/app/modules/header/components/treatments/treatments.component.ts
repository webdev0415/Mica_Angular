import { Observable } from "rxjs/Observable";
import { activeIllnessValue } from "./../../../../state/workbench/workbench.selectors";
import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { select } from "@angular-redux/store";
import {map} from "rxjs/operators";

@Component({
  selector: "header-treatments",
  templateUrl: "./treatments.component.html",
  styleUrls: ["./treatments.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreatmentsComponent implements OnInit {
  @select(activeIllnessValue) activeIllnessValue: Observable<Illness.Normalized.IllnessValue>;
  activeIllnessCode = this.activeIllnessValue.pipe(map(this.observableMap)) as Observable<string>;

  constructor() { }

  ngOnInit() {
  }

  private observableMap(v: Illness.Normalized.IllnessValue) {
    return v ? v.form.idIcd10Code : ""
  }

}
