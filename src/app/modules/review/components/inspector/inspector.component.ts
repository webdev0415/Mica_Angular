import { Router, NavigationStart, Event } from "@angular/router";
import { Observable } from "rxjs/Observable";
import { readOnlyIllness } from "app/state/workbench/workbench.selectors";
import { select, NgRedux } from "@angular-redux/store";
import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { validateIllnessValue } from "app/util/forms/validators/illness-value";
import { setReadOnlyIllness } from "app/state/workbench/workbench.actions";
import * as _ from "lodash";
import { filter, map } from "rxjs/operators";

@Component({
  selector: "review-inspector",
  templateUrl: "./inspector.component.html",
  styleUrls: ["./inspector.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InspectorComponent implements OnInit {
  @select(readOnlyIllness) readOnlyIllness: Observable<Illness.Normalized.IllnessValue>;
  dataCorruptMsg: Observable<string>;
  get state() { return this.s.getState() }

  constructor(
    private s: NgRedux<State.Root>,
    private router: Router) {
    router.events
      .pipe(
         filter(this.isNeededEvent),
      )
      .subscribe(this.onRouteChange.bind(this));
  }

  ngOnInit() {
    this.dataCorruptMsg = this.readOnlyIllness
      .pipe(
         filter(this.exists),
         map(this.onReadonlyIllness.bind(this))
      );
  }

  private isNeededEvent = (ev: Event) => ev instanceof NavigationStart && !~_.indexOf(ev.url, "inspector");

  private exists = (val: any) => !!val;

  private onRouteChange() {
    this.s.dispatch(setReadOnlyIllness(null));
  }

  private onReadonlyIllness(value: Illness.Normalized.IllnessValue) {
    try {
      validateIllnessValue(value, this.state);
    } catch (error) {
      console.error("Data corrupt for: ", value);
      console.log("Error: ", error);
    }
  }
}
