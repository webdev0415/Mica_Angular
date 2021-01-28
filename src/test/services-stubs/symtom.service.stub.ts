/**
 * Created by sergeyyudintsev on 16.10.17.
 */
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {of} from "rxjs/observable/of";

@Injectable()
export class SymptomServiceStub {
  rehydrateSymptomGroups() {
    return of(true);
  }
  symptomGroupAll() {
    return;
  }
  lazyCheckWorkbenchDataVersion() {
    return of(true);
  }
  lazyCheckDefinitions() {
    return of(true);
  }

  /* istanbul ignore next */
  getSymptomDefinitions() {

  }

  fetchNlpSymptoms() {
    return of({})
  }
}
