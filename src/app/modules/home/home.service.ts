import { Injectable } from "@angular/core";
import { NgRedux } from "@angular-redux/store";
import { Observable } from "rxjs/Observable";
import * as _ from "lodash";
import { of } from "rxjs/observable/of";
import { ErrorObservable } from "rxjs/observable/ErrorObservable";
import { pluck, timeout, map, flatMap } from "rxjs/operators";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Subject } from "rxjs/Subject";

@Injectable()
export class HomeService {
  tasksLoading: Subject<boolean> = new Subject<boolean>();
  private get state() { return this.s.getState(); }
  private get apiConfig() { return this.state.global.api.MITA; }
  private get apiTimeout() { return this.state.global.apiTimeout; }

  constructor(private s: NgRedux<State.Root>,
              private http: HttpClient) { }

  get tasks$(): Observable<Task.Data[]> {
    const state = this.s.getState();
    if (!state.user.name) return of([]);
    const role = state.user.roleName;
    const id = state.user.userID;
    if (!role || !id) return ErrorObservable.create("Missing user data");
    const url = `${this.apiConfig.root}/mica/${role}/${this.apiConfig.tasks}/${id}`;

    // console.log("requesting tasks from MITA at: ", url);
    return this.http.get(url)
      .pipe(
          timeout(this.apiTimeout),
          pluck("task"),
          map((tasks: Task.Data[]) => {
            const ordered = _.orderBy(tasks, "taskId");
            return _.map(ordered, task => {
              // task.illnesses = (<any>task).illness;
              // delete (<any>task).illness;
              task.illness = _.map(task.illness, ill => {
                ill.criticality = 1;
                return ill;
              });
              return task;
            });
          })
      )
  }

  /* istanbul ignore next */
  skipIllness(illness: Illness.Data): Observable<any> {
    const user = this.state.user;
    if (!user) return ErrorObservable.create("no user selected");
    const role = user.roleName ? user.roleName.toLowerCase() : "";
    const url = `${this.apiConfig.root}/mica/${role}/skip`;
    const id = user.userID;
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    const options = { headers: headers };
    const body = {
      collectorId: id,
      illnessCode: illness.idIcd10Code,
      version: illness.version
    };

    return this.http.post(url, body, options)
      .pipe(
        timeout(this.apiTimeout),
        flatMap(data => data === false
          ? ErrorObservable.create({ status: "", message: `MICA can't remove ${illness.idIcd10Code}` })
          : of(data)
        )
      );
  }


}
