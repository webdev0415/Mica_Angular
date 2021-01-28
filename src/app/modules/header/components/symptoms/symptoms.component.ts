import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from "@angular/core";
import { NgRedux } from "@angular-redux/store";
import * as _ from "lodash";
import { Observable } from "rxjs/Observable";
import { activeIllnessValue } from "../../../../state/workbench/workbench.selectors";
import { select } from "@angular-redux/store";
import { distinctUntilChanged, map } from "rxjs/operators";

@Component({
  selector: "header-symptoms",
  templateUrl: "./symptoms.component.html",
  styleUrls: ["./symptoms.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SymptomsComponent implements OnInit, OnDestroy {
  @select(activeIllnessValue) activeIllnessValue: Observable<Illness.Normalized.IllnessValue>;
  navItems: MICA.SymptomNavItem[];
  private get state() {return this.s.getState()}

  constructor(private s: NgRedux<State.Root>) { }

  ngOnInit() {
    console.log(this.state.nav.symptomItems);
    this.navItems = this.state.nav.symptomItems;
  }

  ngOnDestroy() {
  }

  isComplete(navItem: string): Observable<boolean> {
    return this.activeIllnessValue
      .pipe(
        map(illness => illness ? illness.form.groupsComplete : []),
        map(c => !!~_.indexOf(c, navItem)),
        distinctUntilChanged()
      );
  }

}
