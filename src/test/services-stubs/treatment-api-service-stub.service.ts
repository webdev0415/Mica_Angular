/**
 * Created by sergeyyudintsev on 17.10.17.
 */
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { of } from 'rxjs/observable/of';
const fakeTreatments = require('./../../test/data/treatments.json');

@Injectable()
export class TreatmentApiServiceStub {
  treatmentTypes(): Observable<Treatments.Types.Template[]> {
    return of(fakeTreatments);
  }

  /* istanbul ignore next */
  createTreatmentType() {
  }

  /* istanbul ignore next */
  setRecordFor() {
  }

  /* istanbul ignore next */
  getRecordFor() {
  }

  /* istanbul ignore next */
  saveRecord() {
  }

  /* istanbul ignore next */
  getTreatmentSourcesByCode() {
  }
}
