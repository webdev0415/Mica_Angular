import { activeIllnessErrors } from "./../../../state/workbench/workbench.selectors";
import { TOGGLE_ILLNESS_ERRORS } from "./../../../state/nav/nav.actions";
import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { select, NgRedux } from "@angular-redux/store";
import { Observable } from "rxjs/Observable";
import * as _ from "lodash";
import {map} from "rxjs/operators";
import {of} from "rxjs/observable/of";

@Component({
  selector: "mica-illness-error-counter",
  templateUrl: "./illness-error-counter.component.html",
  styleUrls: ["./illness-error-counter.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IllnessErrorCounterComponent implements OnInit {
  @select(activeIllnessErrors) illErrors: Observable<Task.ActiveIllnessError>;
  tasksToDo: Observable<number> = of(0);
  private getSymptomsCount = (errs: Task.ActiveIllnessError) => _.reduce(errs.symptoms, (acc, err) => {
    return acc + err.length;
  }, 0);
  private getTasksCount = (errs: Task.ActiveIllnessError) => {
    const symptomsLength = this.getSymptomsCount(errs);
    return symptomsLength + _.keys(errs.illness).length;
  };
  constructor(private s: NgRedux<State.Root>) { }

  ngOnInit() {
    this.tasksToDo = this.illErrors.pipe(map(this.getTasksCount));
  }

  onToggleErrors() {
    this.s.dispatch({type: TOGGLE_ILLNESS_ERRORS})
  }

}
