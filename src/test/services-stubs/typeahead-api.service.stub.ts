/**
 * Created by sergeyyudintsev on 17.10.17.
 */
import {Injectable} from "@angular/core";
import {Observable} from "../../../node_modules/rxjs";
import {of} from "rxjs/observable/of";

@Injectable()
export class TypeaheadApiServiceStub {
  search(
    term: string, url: string,
    /* istanbul ignore next */
    queryParams = ""): Observable<MICA.SelectableEl[]> {
    return of([]);
  }
}
