import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';

@Injectable()
export class SourceServiceStub {

  searchSymptomSources(word: string) {
    return of([word]);
  }

  addSymptomSource(record: SourceInfo.Source): Observable<SourceInfo.Source> {
    record.sourceID = 23;
    return of(record);
  }

  getSymptomSourcesByIllness() {
    return of([{}]);
  }

  addTreatmentSource() {
    return of({});
  }

  searchTreatmentSources() {
    return of([{}]);
  }

  getTreatmentSourcesByCode() {
    return of([{}]);
  }

  removeTreatmentSource() {
    return of();
  }

  removeSymptomSource() {
    return of();
  }

}
