/**
 * Created by sergeyyudintsev on 05.10.17.
 */
import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { of } from "rxjs/observable/of";
const fakeTasks = require("../../test/data/tasks.json");
const fakeIllnesses = require("../../test/data/illnesses.json");

@Injectable()

export class IllnessServiceStub {
  loadIllnesses = new Subject<boolean>();
  /* istanbul ignore next */
  getState() {

  }
  /* istanbul ignore next */
  syncIllnessData(): Observable<Task.SyncIllnessResponse> {
    return of(fakeTasks.syncIllnessResponse)
  }
  /* istanbul ignore next */
  updateIllStatus(payload: MICA.API.UpdateIllnessState.RequestItem[]) {
    return of({
      status: "OK",
      count: 1,
      idIcd10Codes: [payload[0].icd10Code]
  });
  }
  /* istanbul ignore next */
  getUserIllnessSavedByState(states: Illness.State[]): Observable<Illness.FormValue[]> {
    const illness = fakeIllnesses[0];
    return of(illness && [illness.form])
  }
  /* istanbul ignore next */
  getIllnesses() {

  }
  /* istanbul ignore next */
  getApprovedIllnesses() {
    return of({
      content: [],
      totalElements: 10
    })
  }

  searchIllnesses(term: string) {
    return of([]);
  }

  get loadIllnessesTracker(): Observable<boolean> {
    return of(true);
  }
}
