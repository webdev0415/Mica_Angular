import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NgRedux } from '@angular-redux/store';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { take, timeout } from 'rxjs/operators';

@Injectable()
export class SourceService {
  private get state() { return this.s.getState(); }
  private get apiTimeout() { return this.state.global.apiTimeout; }

  constructor(private s: NgRedux<State.Root>,
              private http: HttpClient) { }

  searchSymptomSources(keyword: string): Observable<any> {
    const url = this.state.global.api.symptomSources.search;
    const encodedKeyword = encodeURIComponent(keyword);

    return this.http.get(`${url}?source=${encodedKeyword}`).pipe(
      timeout(this.apiTimeout)
    );
  }

  getSymptomSourcesByIllness(icd10Code: string, version: number, state: Illness.State): Observable<SourceInfo.Source[]> {
    const url = `${this.state.global.api.symptomSources.getByIllness}?icd10code=${icd10Code}&version=${version}&state=${state}`;

    return this.http.get<SourceInfo.Source[]>(url).pipe(timeout(this.apiTimeout), take(1));
  }

  addSymptomSource(record: SourceInfo.Source): Observable<any> {
    const url = this.state.global.api.symptomSources.add;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const options = {
      headers
    };

    return this.http.post(url, record, options).pipe(
      timeout(this.apiTimeout)
    )
  }

  addTreatmentSource(record: SourceInfo.Source): Observable<any> {
    const url = this.state.global.api.treatmentSources.add;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const options = {
      headers
    };

    return this.http.post(url, record, options).pipe(
      timeout(this.apiTimeout)
    )
  }


  searchTreatmentSources(keyword: string): Observable<any> {
    const url = this.state.global.api.treatmentSources.search;

    return this.http.get(`${url}?source=${keyword}`).pipe(
      timeout(this.apiTimeout)
    );
  }

  getTreatmentSourcesByCode(code: string, type: string): Observable<SourceInfo.Source[]> {
    const url = this.state.global.api.treatmentSources.getByCode;

    return this.http.get<SourceInfo.Source[]>(url, { params: (type === 'SYMPTOM' ? { symptomID: code } : { icd10code: code }) })
      .pipe(
        timeout(this.apiTimeout)
      );
  }

  removeTreatmentSource(payload: SourceInfo.RemovePayload): Observable<any> {
    const url = this.state.global.api.treatmentSources.remove;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<SourceInfo.Source[]>(url, payload, { headers })
      .pipe(
        timeout(this.apiTimeout)
      );
  }

  removeSymptomSource(payload: SourceInfo.RemovePayload): Observable<any> {
    const url = this.state.global.api.symptomSources.remove;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<SourceInfo.Source[]>(url, payload, { headers })
      .pipe(
        timeout(this.apiTimeout)
      );
  }

}
