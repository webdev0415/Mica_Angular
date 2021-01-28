import { HomeService } from "../home.service";
import { tasksSelector } from "app/state/task/task.selectors";
import { TitleService } from "../../global-providers/services/title.service";
import {
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy
} from "@angular/core";
import { NgRedux, select } from "@angular-redux/store";
import { Observable, Subscription } from "rxjs";
import * as _ from "lodash";
import { setTasks, checkedPreviousVersion } from "../../../state/task/task.actions";
import { illnessValues } from "../../../state/workbench/workbench.selectors";
import { upsertIllnessNorm } from "../../../state/workbench/workbench.actions";
import { catchError, finalize } from "rxjs/operators";
import {setCurrentApp} from "../../../state/global/global.actions";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "mica-home",
  templateUrl: "./layout.component.html",
  styleUrls: ["./layout.component.sass"]
})
export class LayoutComponent implements OnInit, OnDestroy {
  @select(tasksSelector) tasks$: Observable<Task.Data[]>;
  dataLoading = true;
  tasksComplete: Task.Data[];
  tasksOngoing: Task.Data[];
  taskOngoingWithLimit: Task.Data[];
  limitIllnesses = 50;
  taskErrorMsg = "";
  newTasksAvailable: Task.Data[] = [];
  newTasksCounter = 0;
  enableLazyLoading = true;
  removeEnabled = true;

  private lazyLoadTasks: Subscription;
  private subs: Subscription[] = [];

  constructor(private cd: ChangeDetectorRef,
              private title: TitleService,
              private homeSvc: HomeService,
              private s: NgRedux<State.Root>) {
  }

  get tasksLoading() {
    return this.homeSvc.tasksLoading;
  }

  ngOnInit() {
    this.s.dispatch(setCurrentApp("mica"));
    this.title.pageTitle = ["Task List"];
    // subscription to the update task in the store
    this.subs.push(this.tasks$.subscribe(this.onTasks.bind(this)));
  }

  ngOnDestroy() {
    if (this.lazyLoadTasks) this.lazyLoadTasks.unsubscribe();
    _.each(this.subs, sub => sub.unsubscribe());
  }

  onReloadTasks(): void {
    if (this.newTasksAvailable.length) {
      this.s.dispatch(setTasks(this.newTasksAvailable));
      this.newTasksAvailable = [];
      this.newTasksCounter = 0;
    } else {
      this.dataLoading = true;
      this.loadTasksOnce();
    }
    this.s.dispatch(checkedPreviousVersion(false));
  }

  onEnableRemove(removeEnabled: boolean) {
    this.removeEnabled = removeEnabled;
  }

  private sortByDate = (a: Task.Data, b: Task.Data) => {
    return Number(b.dateComplete) - Number(a.dateComplete);
  };

  private sortByCode = (a: Illness.Data, b: Illness.Data) => {
    if (a.idIcd10Code > b.idIcd10Code)
      return 1;
    if (a.idIcd10Code < b.idIcd10Code)
      return -1;
    return 0;
  };

  private getIllnessCount(sum: number, task: Task.Data) {
    return sum + task.illness.length;
  }

  private tasksWithLimitedIllnesses(tasks: Task.Data[], limit: number) {
    let result: Task.Data[] = [];
    let count = 0;
    const editTasks: Task.Data[] = [];
    const editLimit = 100;
    let countEdit = 0;

    tasks.forEach(t => {
      if (t.taskId > -1) {
        count = result.reduce((sum, task) => sum + task.illness.length, 0);
        if (count >= limit) {
          return;
        }
        const illness = t.illness;
        if (illness.length <= limit - count) {
          result.push(t);
        } else {
          result.push({
            ...t,
            illness: t.illness.sort(this.sortByCode).slice(0, limit - count)
          });
        }
      } else {
        countEdit = editTasks.reduce(this.getIllnessCount, 0);
        /* istanbul ignore next */
        if (countEdit >= editLimit) {
          return;
        }
        const illness = t.illness;
        if (illness.length <= editLimit - countEdit) {
          editTasks.push(t);
        } else {
          editTasks.push({
            ...t,
            illness: t.illness.sort(this.sortByCode).slice(0, editLimit - countEdit)
          });
        }
      }
    });
    if (editTasks.length) {
      result = result.concat(editTasks);
    }
    return result;
  }

  private get taskLoader(): Observable<Task.Data[]> {
    this.homeSvc.tasksLoading.next(true);
    return this.homeSvc.tasks$
      .pipe(
        catchError(err => {
          if (err.name === "TimeoutError") {
            console.error("Timeout when requesting tasks: ", err);
            this.taskErrorMsg = "Timeout in Tasks HomeComponent MITA user endpoint";
          } else if (err.status === 500) {
            console.error("Server returned 500", err);
            this.taskErrorMsg = "There is an internal problem in the server."
          } else {
            console.error("Unable to get tasks: ", err);
            this.taskErrorMsg = err.message || "Error and no message when requesting tasks from MITA service";
          }
          return [];
        }),
        finalize(() => {
          this.dataLoading = false;
          this.homeSvc.tasksLoading.next(false);
          this.cd.markForCheck();
        })
      );
  }

  private loadTasksOnce(): Subscription {
    this.dataLoading = true;
    this.enableLazyLoading = false;
    return this.taskLoader.subscribe(ts => this.s.dispatch(setTasks(ts)));
  }

  private onTasks(tasksStored: Task.Data[]) {
    if (tasksStored.length) {
      this.taskErrorMsg = "";
      [this.tasksComplete, this.tasksOngoing] = _.partition(tasksStored, "dateComplete");
      this.taskOngoingWithLimit = this.tasksWithLimitedIllnesses(this.tasksOngoing, this.limitIllnesses);
      this.tasksComplete = this.tasksComplete.sort(this.sortByDate).slice(0, 2);
      this.cd.markForCheck();
      this.processStoredTasks(tasksStored);
      this.dataLoading = false;
      this.enableLazyLoading = true;
    } else {
      // Loading from the backend when the tasks are empty
      if (!this.enableLazyLoading) {
        // prevent looping request
        return;
      }
      this.taskLoader.subscribe(ts => {
        this.enableLazyLoading = false;
        const taskIllnesses = _.flatten(_.map(ts, "illness"));
        this.s.dispatch(setTasks(ts));

        _.each(illnessValues(this.s.getState()), (i: Illness.Normalized.IllnessValue) => {
          const taskIllness = _.find(taskIllnesses, {idIcd10Code: i.form.idIcd10Code});
          if (taskIllness && taskIllness.version !== i.form.version) {
            const newIllness: Illness.Normalized.IllnessValue = {
              ...i,
              form: {
                ...i.form,
                version: taskIllness.version
              }
            };
            this.s.dispatch(upsertIllnessNorm(newIllness));
          }
        });
      })
    }
  }

  private processStoredTasks(tasksStored: Task.Data[]) {
    const anyTaskIsComplete = _.some(this.tasksComplete, t => {
      return !t.illness.length && !t.dateComplete;
    });
    if (anyTaskIsComplete) {
      // refresh list
      this.loadTasksOnce();
    } else {
      // Lazy checks to be notified to user
      if (!this.enableLazyLoading) {
        // preventing lazyloading after request to the backend
        return
      }
      if (this.lazyLoadTasks) {
        this.lazyLoadTasks.unsubscribe()
      }
      this.lazyLoadTasks = this.taskLoader.subscribe(dataTasks => {
        if (dataTasks.length > tasksStored.length) {
          this.newTasksAvailable = dataTasks;
          this.newTasksCounter = dataTasks.length - tasksStored.length;
          this.cd.markForCheck();
        }
      }, err => {
        if (err.name === "TimeoutError") {
          console.log("Lazy checks for new tasks timed out");
        } else {
          console.log("Lazy checks for new tasks failed: ", err);
        }
      });
    }
  }
}
