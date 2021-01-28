import { userID } from "app/state/user/user.selectors";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { NgRedux, select } from "@angular-redux/store";
import * as _ from "lodash";
import { map, pluck, timeout } from "rxjs/operators";
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { optimizeSymptomValue } from "app/modules/symptom/symptom.factory";

@Injectable()
export class IllnessService {
  @select([ "task" ]) task$: Observable<State.TaskState>;

  private get state() {return this.s.getState()}
  private get apiConfig() { return this.state.global.api.MICA }
  private get apiTimeout() { return this.state.global.apiTimeout }

  constructor(private http: HttpClient,
              private s: NgRedux<State.Root>) {}

  syncIllnessData(illness: Illness.FormValue): Observable<Task.SyncIllnessResponse> {
    const preparedIllness = this.prepareIllnessForSaving(illness);
    const payload = {
      userData: [_.assign(preparedIllness, { userID: userID(this.state) })]
    };
    const headers = new HttpHeaders({
      "Content-Type": "application/json"
    });
    const api = this.state.global.api.MICA;
    const url = api.saveIllness;

    return this.http.post(url, payload, { headers: headers, observe: "response", responseType: "text" }).pipe(
      timeout(this.apiTimeout),
      map(this.parseResponse)
    );
  }

  updateIllStatus(payload: MICA.API.UpdateIllnessState.RequestItem[]): Observable<MICA.API.UpdateIllnessState.Response> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json"
    });
    const api = this.state.global.api.MICA;
    const url = _.join([api.saveIllness, api.updateIllState], "/");

    return this.http.put(url, payload, { headers: headers, responseType: "text", observe: "response" }).pipe(
      timeout(this.apiTimeout),
      map(this.parseResponse)
    );
  }

  getUserIllnessSavedByState(states: Illness.State[]): Observable<Illness.FormValue[]> {
    const state = this.s.getState();
    const payload: MICA.User.GetIllnessByState = {
      userID: state.user.userID,
      state: states
    };
    const headers = new HttpHeaders({
      "Content-Type": "application/json"
    });
    const options = {
      headers: headers
    };
    const url = _.join([this.apiConfig.fetchSavedIllnesses], "/");

    return this.http.post(url, payload, options).pipe(
      timeout(this.apiTimeout),
      pluck("userData"),
    );
  }

  getIllnesses(): Observable<Illness.DataShort[]> {
    return this.http.get(this.apiConfig.illnesses, {observe: "response"}).pipe(
      timeout(this.apiTimeout),
      map(this.parseResponse),
      pluck("content")
    );
  }

  getApprovedIllnesses(symptomID: any, page: number, size: number) {
    const url = `${this.apiConfig.approvedIllnesses}?source=MICA&page=${page}&size=${size}&symptomID=${symptomID}`;
    return this.http.get(url).pipe(timeout(this.apiTimeout));
  }

  searchIllnesses(term: string): Observable<Illness.SearchValue[]> {
    return this.http.get<Illness.SearchValue[]>(`${this.apiConfig.searchIllnesses}/${term}`);
  }

  private parseResponse(response: HttpResponse<any>) {
    try {
      try {
        return JSON.parse(response.body);
      } catch (err) {
        return response.body;
      }
    } catch (error) {
      throw Error("Unable to parse response");
    }
  }

  private prepareIllnessForSaving(illness: Illness.FormValue) {
    const clonedValue = _.cloneDeep(illness);

    clonedValue.symptomGroups.forEach(group => {

      group.categories && group.categories.forEach(cat => {
        cat.symptoms.forEach(symptom => {
          optimizeSymptomValue(symptom, this.state);
        });
      });

      group.sections && group.sections.forEach(section => {
        section.categories && Object.values(section.categories).forEach(cat => {
          cat.symptoms.forEach(symptom => {
            optimizeSymptomValue(symptom, this.state);
          });
        });
      });

    });

    return clonedValue;
  }
}
