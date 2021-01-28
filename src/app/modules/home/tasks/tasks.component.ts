import { HomeService } from "../home.service";
import { insertLocalIllness, checkedPreviousVersion } from "app/state/task/task.actions";
import { illnessValue } from "app/state/workbench/workbench.selectors";
import { isReviewer } from "app/state/user/user.selectors";
import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef,
  Input, Inject, EventEmitter, Output
} from "@angular/core";
import { trigger, state, style, transition, animate, keyframes } from "@angular/animations";
import { DOCUMENT } from "@angular/common";
import { NgRedux } from "@angular-redux/store";
import * as _ from "lodash";
import { Observable, Subscription } from "rxjs";
import { IllnessService } from "app/services";
import { deleteIllness, upsertIllness } from "app/state/workbench/workbench.actions";
import { postMsg } from "app/state/messages/messages.actions";
import { userID } from "app/state/user/user.selectors";
import { ApiService } from "../../typeahead/api.service";
import { of } from "rxjs/observable/of";
import { finalize, flatMap, map, switchMapTo, take, tap, timeout } from "rxjs/operators";
import { forkJoin } from "rxjs/observable/forkJoin";
import SelectableEl = MICA.SelectableEl;

@Component({
  animations: [
    trigger("slideInOut", [
      transition("void => *", [
        animate("0.5s ease-in", keyframes([
          style({opacity: 0, "max-height": 0, offset: 0}),
          style({opacity: 0.3, "max-height": 70, offset: 0.3}),
          style({opacity: 1, "max-height": 1000, offset: 1.0})
        ]))
      ]),
      state("in", style({
        opacity: 1,
        "max-height": "100%",
      })),
      transition("* => void", [
        animate("0.5s ease-out", keyframes([
          style({opacity: 1, "max-height": 100, offset: 0}),
          style({opacity: 0, "max-height": 70, offset: 0.3}),
          style({opacity: 0, "max-height": 0, offset: 1.0})
        ]))
      ])
    ])
  ],
  selector: "mica-tasks",
  templateUrl: "./tasks.component.html",
  styleUrls: ["./tasks.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksComponent implements OnInit, OnDestroy {
  @Input() tasks: Task.Data[] = [];
  @Input() tasksOriginal: Task.Data[];
  @Input() title: string;
  @Input() disabledAccordion: boolean;
  @Input() removeEnabled: boolean;
  @Output() onEnableRemove: EventEmitter<boolean> = new EventEmitter();

  needCheckPreviousVersions: boolean;
  syncedIllnesses: MICA.User.IllnessesByState | undefined;
  illStatesNames = this.state.global.illStates;
  apiTimeout = this.state.global.apiTimeout;
  queue_tasks = 0;

  private activePanels: number[] = [];
  private subs: Subscription[] = [];
  private illnesses: Illness.Data[] = [];

  private get state() {
    return this.s.getState();
  }

  constructor(private illnessSvc: IllnessService,
              private homeSvc: HomeService,
              private s: NgRedux<State.Root>,
              private cd: ChangeDetectorRef,
              private api: ApiService,
              @Inject(DOCUMENT) private document: any) {
  }

  ngOnInit() {
    const isReviewerFlag = isReviewer(this.state);

    if (!this.disabledAccordion && this.tasks) {
      this.queue_tasks = this.tasksOriginal.length - this.tasks.length;
      this.needCheckPreviousVersions = !this.state.task.checkedPreviousVersion;

      const activeTaskId = this.state.workbench.illnesses.activeTaskId;
      // check for tasks length before accessing taskId
      if (activeTaskId && this.tasks.length) {
        // open panel of active illness
        const activeTask = _.find(this.tasks, t => t.taskId === activeTaskId);
        this.activePanels.push(activeTask ? activeTask.taskId : this.tasks[0].taskId);
      } else if (this.tasks.length) {
        // make first panel active if there are tasks
        this.activePanels.push(this.tasks[0].taskId);
      }

      const getStates = isReviewerFlag ? [this.illStatesNames.readyForReview] : [this.illStatesNames.pending];
      const source = this.getGroupedIllnessesByState(getStates).pipe(take(1));

      if (this.needCheckPreviousVersions && !isReviewerFlag) {
        this.checkPreviousVersion().subscribe(() => {
          source.subscribe(data => {
            this.syncedIllnesses = data;
            this.cd.markForCheck();
          });
        })
      } else {
        source.subscribe(data => {
          this.syncedIllnesses = data;
          this.cd.markForCheck();
        });
      }
    } else if (this.needCheckPreviousVersions && !isReviewerFlag) {
      this.checkPreviousVersion().subscribe();
    }
  }

  ngOnDestroy() {
    _.each(this.subs, s => s.unsubscribe());
    this.cd.detach();
  }

  checkPreviousVersion(): Observable<any> {
    this.illnesses = [];
    // search for the illnesses with a version greater than 1 and without stored data
    this.tasks.forEach(task => {
      task.illness.forEach(ill => {
        if (ill.version > 1 && !illnessValue(ill.idIcd10Code, ill.version)(this.state)) {
          this.illnesses.push(ill);
        }
      });
    });

    if (!this.illnesses.length) {
      this.s.dispatch(postMsg(
        `There are no Illnesses with previous versions`,
        { type: "success" }
      ));
      this.s.dispatch(checkedPreviousVersion(true));
      return of({});
    }

    const allResults = forkJoin(this.illnesses.map(ill => this.searchIllnessByID(ill.idIcd10Code)));

    return allResults.pipe(take(1), tap(this.onAllResults.bind(this)));
  }

  searchIllnessByID(id: string) {
    const url = _.get(this.state.global.api.search, "remoteIllnessValue", "") as string;

    return this.api.search(id as string, url).pipe(
      take(1),
      flatMap((res: any) => {
        if (!res.length) {
          return of(null);
        }

        const result = res
          .filter((ill: MICA.SelectableEl) => ill.value.state === this.illStatesNames.approved)
          .sort(this.sortByDesc);

        return result.length ? of(result[0]) : of(null);
      })
    );
  }

  onReviewerIllnessMissing(illnesses: Illness.Data[], task: Task.Data) {
    const illStatesNames = this.state.global.illStates;
    const fromState = task.taskId === -1 ? illStatesNames.approved : illStatesNames.complete;
    const payloadUserID = userID(this.state);

    if (!payloadUserID || payloadUserID < 0) throw Error(`Incorrect user ID: ${payloadUserID}`);

    const payload: MICA.API.UpdateIllnessState.RequestItem[] = _.map(illnesses, illness => ({
      userID: payloadUserID,
      fromState,
      toState: illStatesNames.readyForReview,
      icd10Code: illness.idIcd10Code,
      version: illness.version
    }));

    const illSub = this.illnessSvc
      .updateIllStatus(payload)
      .pipe(
        take(1),
        switchMapTo(this.getGroupedIllnessesByState([illStatesNames.readyForReview]))
      )
      .subscribe(data => {
        this.syncedIllnesses = data;
        this.cd.detectChanges();
      });
    this.subs.push(illSub);
  }

  private getGroupedIllnessesByState(states: Illness.State[]): Observable<MICA.User.IllnessesByState> {
    return this.illnessSvc
      .getUserIllnessSavedByState(states)
      .pipe(
        timeout(this.apiTimeout),
        map(this.upsertIllness.bind(this)),
        map(this.groupByState),
        tap(this.processOrphanedIllnesses.bind(this))
      );
  }

  private onSkipIllness(eventData: [Illness.Data, Event]) {
    const illness = eventData[0];
    const event = eventData[1];
    event.stopPropagation();
    this.disableRemove();
    this.subs.push(this.homeSvc.skipIllness(illness)
      .pipe(
        finalize(this.enableRemove.bind(this))
      )
      .subscribe(() => {
        this.s.dispatch(deleteIllness(illness.idIcd10Code, illness.version));

        const illStatesNames = this.state.global.illStates;
        const getStates = isReviewer(this.state) ? [illStatesNames.readyForReview] : [illStatesNames.pending];

        this.subs.push(this.getGroupedIllnessesByState(getStates)
          .pipe(
            finalize(this.enableRemove.bind(this))
          )
          .subscribe(data => {
            this.syncedIllnesses = data;
            this.cd.detectChanges();
          }));

        this.s.dispatch(postMsg(
          illness.idIcd10Code + " removed from your tasks list.",
          { type: "success" }
        ));
      }));
  }

  trackByFn(index: number): number {
    return index;
  }

  private isPanelActive(id: number) {
    return ~_.indexOf(this.activePanels, id);
  }

  private expand(id: number, ev: Event) {
    ev.preventDefault();
    const active = _.clone(this.activePanels);
    const index = _.indexOf(this.activePanels, id);
    if (~index) {
      active.splice(index, 1);
    } else {
      active.push(id);
    }
    this.activePanels = active;
  }

  private upsertIllness(data: Illness.FormValue[]) {
    const taskIllnesses = _.flatten(_.map(this.tasks, "illness"));
    return _.map(data, (i: Illness.FormValue) => {
      const taskIllness = _.find(taskIllnesses, {idIcd10Code: i.idIcd10Code, version: i.version});
      if (taskIllness) {
        const newIllness: Illness.FormValue = {...i, version: taskIllness.version} as Illness.FormValue;
        this.s.dispatch(upsertIllness(newIllness));
        return newIllness;
      }
      return i;
    });
  }

  private processOrphanedIllnesses(data: {[key: string]: Array<any>}) {
    if (!isReviewer(this.state)) return;
    // Orphaned illnesses are here those that are ready to be worked on, yet are not associated with a MITA task
    // If there are any dispatch them to local task
    // Reducer will handle them regardless of whether local task exists in state already
    const withTask: string[] = _.flatMap(_.map(this.tasks, t => _.map(t.illness, "idIcd10Code")));
    const orphans = _.reject(data[this.state.global.illStates.readyForReview], d => ~_.indexOf(withTask, d.idIcd10Code) as any);
    if (orphans.length) {
      this.s.dispatch(insertLocalIllness(orphans));
      if (!this.activePanels.length) this.activePanels.push(-1); // activate panel if reviewer has no other tasks
    }
  }

  private groupByState = (data: Illness.FormValue[]) => _.groupBy(data, "state");

  private sortByDesc = (a: MICA.SelectableEl, b: MICA.SelectableEl) => b.value.version - a.value.version;

  private onAllResults(prevIllnesses: SelectableEl[]): void {
    const updatedIllnesses = this.illnesses.reduce((res, ill, i) => {
      if (prevIllnesses[i]) {
        const newIllness = {
          ...prevIllnesses[i].value,
          version: ill.version,
          state: this.illStatesNames.pending
        } as Illness.FormValue;

        this.s.dispatch(upsertIllness(newIllness));
        res.push(newIllness.idIcd10Code);
      }

      return res;
    }, <string[]>[]);

    this.s.dispatch(checkedPreviousVersion(true));

    if (!updatedIllnesses.length) {
      this.s.dispatch(postMsg(
        `Data of previous versions Illnesses not found`,
        { type: "success" }
      ));
      return;
    }

    this.s.dispatch(postMsg(
      `Found a previous version of the Illnesses for ${updatedIllnesses.join()}`,
      { type: "success" }
    ));
  }

  private enableRemove() {
    this.onEnableRemove.emit(true);
  }

  private disableRemove() {
    this.onEnableRemove.emit(false);
  }
}
