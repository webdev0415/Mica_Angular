import { Injectable } from "@angular/core";
import { NgRedux } from "@angular-redux/store";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { timeout } from "rxjs/operators";
import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class GroupService {

  searchBarClear = new Subject<boolean>();


  private get state() {
    return this.s.getState();
  }

  private get apiTimeout() {
    return this.state.global.apiTimeout;
  }

  constructor(private s: NgRedux<State.Root>,
              private http: HttpClient) {
  }

  searchBarClearListener() {
    return this.searchBarClear.asObservable();
  }

  getAllGroups(): Observable<Groups.Group[]> {
    const url = this.state.global.api.symptomGroups.all;
    return this.http.get<Groups.Group[]>(url).pipe(
      timeout(this.apiTimeout)
    );
  }

  getSymptomsInGroup(groupID: number): Observable<Groups.SymptomsInGroup> {
    const url = this.state.global.api.symptomGroups.getSymptomsInGroup;
    return this.http.get<Groups.SymptomsInGroup>(`${url}${groupID}`).pipe(
      timeout(this.apiTimeout)
    );
  }

  addGroup(groupData: Groups.Group): Observable<Groups.Group> {
    const url = this.state.global.api.symptomGroups.saveOrUpdate;
    const headers = new HttpHeaders({
      "Content-Type": "application/json"
    });
    const options = {
      headers: headers
    };

    return this.http.post<Groups.Group>(url, groupData, options)
      .pipe(
        timeout(this.apiTimeout)
      )
  }

  deleteGroup(groupID: number) {
    const url = this.state.global.api.symptomGroups.delete;
    const headers = new HttpHeaders({
      "Content-Type": "application/json"
    });
    const options = {
      headers: headers,
      responseType: "text" as "json"
    };

    return this.http.delete(`${url}${groupID}`, options);
  }

  updateSymptomsInGroup(SymptomsInGroup: Groups.SymptomsInGroup) {
    const url = this.state.global.api.symptomGroups.getSymptomsInGroup;
    const headers = new HttpHeaders({
      "Content-Type": "application/json"
    });
    const options = {
      headers: headers,
      responseType: "text" as "json"
    };

    return this.http.put(url, SymptomsInGroup, options).pipe(
      timeout(this.apiTimeout)
    );
  }


}
