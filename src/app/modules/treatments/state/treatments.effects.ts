import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as TreatmentsActions from './treatments.actions';
import { map, mergeMap, pluck, withLatestFrom } from 'rxjs/operators';
import { TreatmentsApiService } from '../services/treatments-api.service';
import { IllnessService } from '../../../services';
import { select, Store } from '@ngrx/store';
import { selectCurrentTreatmentsRecord } from './treatments.selectors';
import { TreatmentsDataService } from '../services/treatments-data.service';

@Injectable({
  providedIn: 'root'
})
export class TreatmentsEffects {

  loadTreatmentTypes$ = createEffect(() => this.actions$.pipe(
    ofType(TreatmentsActions.loadTreatmentTypes),
    mergeMap(() => this.treatmentsApi.loadTreatmentTypes().pipe(
      map(data => TreatmentsActions.loadTreatmentTypesSuccess(data))
    )),
  ));

  searchDrugsByName$ = createEffect(() => this.actions$.pipe(
    ofType(TreatmentsActions.searchDrugsByName),
    mergeMap(({ term, drugType, source }) => this.treatmentsApi.searchDrugsByName(term, drugType, source).pipe(
      map(drugs => TreatmentsActions.searchDrugsByNameSuccess({ drugs }))
    )),
  ));

  loadDrugInfo$ = createEffect(() => this.actions$.pipe(
    ofType(TreatmentsActions.loadDrugInfo),
    mergeMap(({ productId, drugType, cardinality, ndc }) => this.treatmentsApi.loadDrugInfo(productId, drugType, cardinality, ndc).pipe(
      map(drug => TreatmentsActions.loadDrugInfoSuccess({ drug }))
    )),
  ));

  searchStepperIllnesses$ = createEffect(() => this.actions$.pipe(
    ofType(TreatmentsActions.searchStepperIllnesses),
    mergeMap(({ term }) => this.illnessesApi.searchIllnesses(term).pipe(
      map(illnesses => TreatmentsActions.searchStepperIllnessesSuccess({ illnesses }))
    )),
  ));

  searchStepperIllnessesTwo$ = createEffect(() => this.actions$.pipe(
    ofType(TreatmentsActions.searchStepperIllnessesTwo),
    mergeMap(({ term }) => this.illnessesApi.searchIllnesses(term).pipe(
      map(illnesses => TreatmentsActions.searchStepperIllnessesTwoSuccess({ illnesses }))
    )),
  ));

  saveDrug$ = createEffect(() => this.actions$.pipe(
    ofType(TreatmentsActions.saveDrug),
    withLatestFrom(this.store.pipe(select(selectCurrentTreatmentsRecord), pluck('record'))),
    mergeMap(([payload, record]) => {
      const updatedRecord = this.treatmentsData.saveDrugToRecord(payload, record);

      return this.treatmentsApi.saveRecord(updatedRecord).pipe(
        map(() => TreatmentsActions.updateRecord({ record: updatedRecord }))
      );
    }),
  ));

  saveNonDrug$ = createEffect(() => this.actions$.pipe(
    ofType(TreatmentsActions.saveNonDrug),
    withLatestFrom(this.store.pipe(select(selectCurrentTreatmentsRecord), pluck('record'))),
    mergeMap(([payload, record]) => {
      const updatedRecord = this.treatmentsData.saveNonDrugToRecord(payload, record);

      return this.treatmentsApi.saveRecord(updatedRecord).pipe(
        map(() => TreatmentsActions.updateRecord({ record: updatedRecord }))
      );
    }),
  ));

  removeDrug$ = createEffect(() => this.actions$.pipe(
    ofType(TreatmentsActions.removeDrug),
    withLatestFrom(this.store.pipe(select(selectCurrentTreatmentsRecord), pluck('record'))),
    mergeMap(([payload, record]) => {
      const updatedRecord = this.treatmentsData.removeDrugFromRecord(payload, record);

      return this.treatmentsApi.saveRecord(updatedRecord).pipe(
        map(() => TreatmentsActions.updateRecord({ record: updatedRecord }))
      );
    }),
  ));

  removeNonDrug$ = createEffect(() => this.actions$.pipe(
    ofType(TreatmentsActions.removeNonDrug),
    withLatestFrom(this.store.pipe(select(selectCurrentTreatmentsRecord), pluck('record'))),
    mergeMap(([payload, record]) => {
      const updatedRecord = this.treatmentsData.removeNonDrugFromRecord(payload, record);

      return this.treatmentsApi.saveRecord(updatedRecord).pipe(
        map(() => TreatmentsActions.updateRecord({ record: updatedRecord }))
      );
    }),
  ));

  constructor(private actions$: Actions,
              private treatmentsApi: TreatmentsApiService,
              private illnessesApi: IllnessService,
              private treatmentsData: TreatmentsDataService,
              private store: Store) {
  }
}
