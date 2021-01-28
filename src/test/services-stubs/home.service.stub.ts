/**
 * Created by sergeyyudintsev on 16/02/2018.
 */
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {of} from "rxjs/observable/of";
import {Subject} from "rxjs/Subject";
const fakeTasks = require("../../test/data/tasks.json");
@Injectable()
export class HomeServiceStub {
  tasksLoading: Subject<boolean> = new Subject<boolean>();
  get tasks$() {
    return of(fakeTasks.tasks)
  }
  skipIllness(illness: Illness.Data): Observable<any> {
    return of(null);
  }
}
