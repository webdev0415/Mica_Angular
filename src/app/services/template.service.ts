import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { NgRedux } from "@angular-redux/store";
import * as _ from "lodash";
import { upgradeSymptomTemplates } from "app/state/symptom-templates/templates.actions";
import { Router } from "@angular/router";
import { map } from "rxjs/operators";
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";

@Injectable()
export class TemplateService {
  private get state() {
    return this.s.getState();
  }

  constructor(private s: NgRedux<State.Root>,
              private http: HttpClient,
              private router: Router) {
  }

  getTemplate(symptomID: string): Observable<Symptom.Template> {
    const url = _.join([this.state.global.api.symptoms.template, symptomID], "/");

    return this.http.get<Symptom.Template>(url);
  }

  saveTemplate(t: Symptom.Template): Observable<Symptom.Template> {
    const url = this.state.global.api.symptoms.template;
    const headers = new HttpHeaders({
      "Content-Type": "application/json"
    });
    const options = { headers };
    let c: Symptom.Template = { ...t, groupID: !t.groupID ? null : (<string>t.groupID).split(",").map(Number) };

    if (_.has(c, "labsOrdered")) {
      c = { ...c, labsOrdered: !c.labsOrdered ? null : (<string>c.labsOrdered).split(",") };
    }

    return this.http.put<Symptom.Template>(url, c, options);
  }

  get errors(): Observable<Symptom.TemplateError[]> {
    const url = this.state.global.api.symptoms.templateError;
    return this.http.get(url, {observe: "response", responseType: "text"})
      .pipe(
        map(this.handleTemplateErrors.bind(this))
      )
  }

  mapData(value: string) {
    let res = "";
    for (let i = 0; i < value.length; i++) {
      if (i !== 0 && value[i] === value[i].toUpperCase()) {
        res += " " + value[i];
      } else {
        res += value[i];
      }
    }
    return res;
  }

  editSymptomTemplate(symptomID: string, editField: string): void {
    if (!symptomID) return;
    this.getTemplate(symptomID).toPromise()
      .then(this.upgradeSymptomTemplates.bind(this, editField));
  }

  private upgradeSymptomTemplates(editField: string, tpl: Symptom.Template) {
    this.s.dispatch(upgradeSymptomTemplates(tpl));
    this.router.navigate(["/templates/editor"], {queryParams: {editField}});
  }

  private handleTemplateErrors(res: HttpResponse<any>) {
    const temp = JSON.parse(res.body || "[]");

    for (let i = 0; i < temp.length; i++) {
      if (temp[i].dataInvalidAttributes) {
        for (let j = 0; j < temp[i].dataInvalidAttributes.length; j++) {
          if (temp[i].dataInvalidAttributes[j] === "ES_Question") {
            temp[i].dataInvalidAttributes[j] = "QuestionInSpanish";
          }
          temp[i].dataInvalidAttributes[j] = this.mapData(temp[i].dataInvalidAttributes[j]);
        }
      }

      if (temp[i].multiplier) {
        const prev = JSON.parse(JSON.stringify(temp[i].multiplier));
        // const prev = Object.assign(temp[i].multiplier);
        let newKey;

        for (const k of Object.keys(temp[i].multiplier)) {
          newKey = this.mapData(k);
          delete temp[i].multiplier[k];
          temp[i].multiplier[newKey] = prev[k];
        }
      }
    }
    return temp;
  }
}
