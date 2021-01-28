import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { select } from "@angular-redux/store";
import { Observable } from "rxjs/Observable";
import { currentIllness } from "./../../../../state/workbench/workbench.selectors";
import { map } from "rxjs/operators";

@Component({
  selector: "header-inspector",
  templateUrl: "./inspector.component.html",
  styleUrls: ["./inspector.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InspectorComponent implements OnInit {
  @select(currentIllness) currentIllness: Observable<Illness.Normalized.IllnessValue>;
  currentIllnessCode = this.currentIllness.pipe(map(this.observableMap)) as Observable<string>;

  constructor() { }

  ngOnInit() {
  }

  private observableMap(v: Illness.Normalized.IllnessValue) {
    return v ? v.form.idIcd10Code : ""
  }

}
