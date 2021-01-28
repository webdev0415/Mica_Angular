import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { NgRedux } from "@angular-redux/store";
import { pluck } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class EcwService {
  private get state() { return this.s.getState(); }

  constructor(private s: NgRedux<State.Root>,
              private http: HttpClient) { }

  getIllnesses(page: number, size: number): Observable<ECW.Response> {
    const url = this.state.global.api.ecw.illness;

    return this.http.get<ECW.Response>(`${url}?source=ECW&page=${page}&size=${size}`);
  }

  getIllnessByIcd10Code(
    code: string,
    /* istanbul ignore next */
    source: SourceInfo.SourceType = "ECW"
  ): Observable<any> {
    const apiUrl = this.state.global.api;
    let url = "";
    switch (source) {
      case "ECW":
        url = apiUrl.ecw.illness;
        break;
      case "NLP":
        url = apiUrl.nlp.illness;
        break;
      default:
        url = apiUrl.ecw.illness;
        break;
    }
    return this.http.get(`${url}/${code}`)
      .pipe(
        pluck("userData")
      )
  }

}
