import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NgRedux } from '@angular-redux/store';
import { timeout } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class TreatmentsApiService {
  constructor(private s: NgRedux<State.Root>,
              private http: HttpClient) { }

  private get state() {
    return this.s.getState();
  }

  private get apiTimeout() {
    return this.state.global.apiTimeout;
  }

  /**
   * Fetches Non Drug Treatment types and orders them by shortName
   */
  loadTreatmentTypes(): Observable<{ treatmentTypes: Treatments.Types.Template[] }> {
    const url = this.state.global.api.treatments.types;

    return this.http.get<{ treatmentTypes: Treatments.Types.Template[] }>(url)
      .pipe(
        timeout(this.apiTimeout)
      );
  }

  createTreatmentType(payload: Treatments.NonDrug.TreatmentDescGroupCreate): Observable<MICA.API.ResponseSimple> {
    const url = this.state.global.api.treatments.types;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const options = {
      headers: headers
    };

    return this.http.post<any>(url, payload, options)
      .pipe(
        timeout(this.apiTimeout)
      );
  }

  getRecordFor(record: string): Observable<Treatments.Record.New> {
    const isSymptom = /^SYMPT/.test(record);
    const api = this.state.global.api.treatments;
    const urlRoot = isSymptom ? api.symptom.get : api.illness.get;
    const url = urlRoot + '/' + record;

    return this.http.get<Treatments.Record.New>(url)
      .pipe(
        timeout(this.apiTimeout)
      );
  }

  saveRecord(record: any) {
    const isSymptom = record.symptomID;
    const api = this.state.global.api.treatments;
    const url = isSymptom ? api.symptom.post : api.illness.post;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const options = {
      headers: headers
    };

    return this.http.post(url, record, options)
      .pipe(
        timeout(this.apiTimeout)
      );
  }

  searchDrugsByName(term: string, drugType: Treatments.Drug.DrugType, source: Treatments.Drug.SearchSource = 'FDA'): Observable<Treatments.Drug.Short[]> {
    const api = this.state.global.api.search.drugByName;
    const params = {
      source,
      word: term,
      type: drugType
    };

    return this.http.get<Treatments.Drug.Short[]>(api, { params })
      .pipe(
        timeout(this.apiTimeout)
      );
  }

  loadDrugInfo(productId: string, drugType: Treatments.Drug.DrugType, cardinality: Treatments.Drug.Cardinality, ndc: boolean): Observable<Treatments.Drug.GenericSearchModel> {
    const api = this.state.global.api.treatments.drugInfo;
    const params: any = {
      productId,
      cardinality,
      ndc,
      type: drugType
    };

    return this.http.get<Treatments.Drug.GenericSearchModel>(api, { params })
      .pipe(
        timeout(this.apiTimeout)
      );
  }
}
