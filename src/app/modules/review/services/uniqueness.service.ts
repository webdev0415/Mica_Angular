import { Injectable } from "@angular/core";
import { NgRedux } from "@angular-redux/store";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable()
export class UniquenessService {
  private get state() { return this.s.getState(); }

  constructor(
    private s: NgRedux<State.Root>,
    private http: HttpClient) { }

  checkUniqueness(idIcd10Code: string, version: number, includetime: boolean): Observable<any> {
    const url = this.state.global.api.MICA.uniqueness;
    const headers = new HttpHeaders({
      "Content-Type": "application/json"
    });
    const options = {
      headers: headers
    };
    let finalUrl = `${url}/${idIcd10Code}?version=${version}`;
    if (includetime) {
      finalUrl += `&includetime=${includetime}`;
    }

    return this.http.get(finalUrl, options);
  }

}
