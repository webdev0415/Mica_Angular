import { readOnlyIllness } from "app/state/workbench/workbench.selectors";
import { localTask } from "app/state/task/task.selectors";
import { Router } from "@angular/router";
import { postMsg } from "app/state/messages/messages.actions";
import { IllnessService } from "app/services/illness.service";
import { FormControl } from "@angular/forms";
import { Observable } from "rxjs/Observable";
import { NgRedux, select } from "@angular-redux/store";
import { Component, OnInit, ChangeDetectionStrategy, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { setReadOnlyIllness, editReadOnlyIllness, setActiveIllness, upsertIllness } from "../../../../state/workbench/workbench.actions";
import { isReadOnlyMode } from "app/state/task/task.selectors";
import { catchError, finalize, map, take } from "rxjs/operators";
import { insertLocalIllness } from "app/state/task/task.actions";
import { activeIllnessValue } from "app/state/workbench/workbench.selectors";
import { setEcwValidationIllness } from "app/state/ecw/ecw.actions";
import { isReviewer } from "app/state/user/user.selectors";
import * as _ from "lodash";
import { ValidationService } from "app/modules/validation/validation.service";
import { throwError } from "rxjs";

@Component({
  selector: "review-illness-search",
  templateUrl: "./illness-search.component.html",
  styleUrls: ["./illness-search.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IllnessSearchComponent implements OnInit {
  @select(isReadOnlyMode) isReadOnlyMode: Observable<boolean>;
  selectedIllnessCode = new FormControl("");
  illnessToInspect: Illness.FormValue | null = null;
  syncing = false;
  limit = 5;
  noSearchInput = false;

  private get state() { return this.s.getState(); }

  constructor(private s: NgRedux<State.Root>,
              private illnessSvc: IllnessService,
              private router: Router,
              private cd: ChangeDetectorRef,
              private validation: ValidationService) { }

  ngOnInit() {
  }

  trackByFn(index: number, illness: MICA.LiveSearchTypeaheadResult) {
    return illness.value.idIcd10Code;
  }

  onSelectIllness(item: MICA.LiveSearchTypeaheadResult, emitter: EventEmitter<any>) {
    emitter.emit({
      name: item.name,
      value: item.value.idIcd10Code
    });
    this.illnessToInspect = item.value;
  }

  onInspectIllness() {
    this.s.dispatch(setReadOnlyIllness(this.illnessToInspect));
    if (this.illnessToInspect) {
      this.setActiveIllness(this.illnessToInspect)
    }
    this.illnessToInspect = null;
    this.selectedIllnessCode.setValue("");
  }

  noSearchInspect(searchType: boolean) {
    this.illnessToInspect = null;
    this.noSearchInput = searchType;
  }

  onEditIllness() {
    const ongoingTask = localTask(this.state);
    const countTask = ongoingTask && ongoingTask.illness ? ongoingTask.illness.length : 0;

    if (countTask >= this.limit) {
      this.s.dispatch(postMsg(
        `You appear to have ${this.limit} local illnesses to submit. Please resolve those before trying to add more.`,
        { type: "warning" }
      ));
      return;
    }

    this.syncing = true;

    const illStatesNames = this.stateNames;
    const illness = readOnlyIllness(this.state);

    if (!illness) {
      console.error("There is no readOnly illness");
      return;
    }

    const payload: MICA.API.UpdateIllnessState.RequestItem[] = [{
      userID: this.state.user.userID,
      fromState: illStatesNames.approved,
      toState: illStatesNames.readyForReview,
      icd10Code: illness.form.idIcd10Code,
      version: illness.form.version
    }];

    this.illnessSvc
      .updateIllStatus(payload)
      .pipe(
        take(1),
        map(() => illness.form),
        finalize(() => {
          this.cd.detectChanges();
        }),
        catchError(this.onUpdateIllStatusError.bind(this))
      )
      .subscribe(this.editIllness.bind(this));
  }

  private onUpdateIllStatusError(error: any, caught: Observable<any>): Observable<any> {
    if (~error.status.indexOf("Illnesses already exists with target state")) {
      console.error(error.status);
      return caught;
    } else {
      return throwError(error);
    }
  }

  private editIllness(illness: Illness.FormValue) {
    this.s.dispatch(editReadOnlyIllness as any);
    const states = [this.stateName];
    const { idIcd10Code, version } = illness;

    this.illnessSvc
      .getUserIllnessSavedByState(states)
      .pipe(
        take(1),
        finalize(() => {
          this.syncing = false;
        }),
        map((illnesses: Illness.FormValue[]) => _.find(illnesses, { idIcd10Code, version }))
      )
      .subscribe(this.insertLocalIllness.bind(this));
  }

  private setActiveIllness(illness: Illness.FormValue) {
    this.s.dispatch(setActiveIllness(
      -1,
      illness.idIcd10Code,
      illness.name,
      illness.version,
      this.stateName
    ));
    const activeIllness = activeIllnessValue(this.state);

    if (activeIllness) {
      this.s.dispatch(setEcwValidationIllness(null, activeIllness));
      this.validation.addSymptomsErrorsToTODO(activeIllness);
    }
  }

  private insertLocalIllness(illness: Illness.FormValue) {
    this.s.dispatch(insertLocalIllness([illness]));
    this.s.dispatch(upsertIllness(illness));
    this.setActiveIllness(illness);
    this.router.navigate(["/review"]);
  }

  private get stateName(): Illness.State {
    return isReviewer(this.state) ? this.stateNames.readyForReview : this.stateNames.pending
  }

  private get stateNames(): { [key: string]: Illness.State } {
    return this.state.global.illStates;
  }

}
