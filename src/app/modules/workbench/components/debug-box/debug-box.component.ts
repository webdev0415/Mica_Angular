import { activeSymptomGroupData } from "./../../../../state/symptoms/symptoms.selectors";
import { Observable } from "rxjs";
import { activeIllnessValue, activeSymptomGroupValue } from "./../../../../state/workbench/workbench.selectors";
import { select, NgRedux } from "@angular-redux/store";
import { FormControl } from "@angular/forms";
import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { environment } from "../../../../../environments/environment";
import * as _ from "lodash";
import {of} from "rxjs/observable/of";
import {map} from "rxjs/operators";

@Component({
  selector: "workbench-debug-box",
  templateUrl: "./debug-box.component.html",
  styleUrls: ["./debug-box.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DebugBoxComponent implements OnInit {
  @select(activeIllnessValue) illness: Observable<Illness.Normalized.IllnessValue>;
  @select(activeSymptomGroupValue) symptomGroup: Observable<Illness.Normalized.SymptomGroup>
  isProduction = environment.production;
  entity = new FormControl("illness"); // "illness" | "symptom group"
  get debugObject() { return this.entity.value === "illness" ? this.illness : this.symptomGroup }
  get title() { return this.entity.value === "illness"
    ? of("illness value")
    : this.symptomGroup
      .pipe(
        map(sg => sg
          ? `Stored value for ${sg.groupID} Symptom Group`
          : `No value stored for ${activeSymptomGroupData(this.state).name} Symptom Group yet.`
        )
      )}
  private get state() {return this.s.getState()}

  constructor(private s: NgRedux<State.Root>) { }

  ngOnInit() {
  }

  get shouldShow(): boolean {
    const email = this.state.user.email;
    const debugUsers = ["jim-shelby@gorvw.net", "shelbymita@gmail.com",
      "vijetha@techmileage.com", "shelbyzgow@gmail.com", "govinda@gmail.com",
      "govinda2@gmail.com", "vijetha5@gmail.com", "vijetha4@gmail.com", "pmunagal@asu.edu", "pragna1@gmail.com"];
    return !this.isProduction || !!~_.indexOf(debugUsers, email);
  }

}
