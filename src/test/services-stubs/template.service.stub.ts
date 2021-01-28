/**
 * Created by sergeyyudintsev on 22.10.17.
 */
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {of} from "rxjs/observable/of";

@Injectable()
export class TemplateServiceStub {
  errors = of([]);
  getTemplate(symptomId: string): Observable<Symptom.Template> {
    return of({} as Symptom.Template);
  }
  /* istanbul ignore next */
  saveTemplate() {}
  editSymptomTemplate() {}
}
