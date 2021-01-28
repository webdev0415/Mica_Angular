/**
 * Created by sergeyyudintsev on 23.10.17.
 */
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {of} from "rxjs/observable/of";

@Injectable()
export class MITAServiceStub {
  get tasks$(): Observable<Task.Data[]> {
    return of([]);
  }
  updateIllnessStatus(): Observable<boolean> {
    return of(true);
  }
}
