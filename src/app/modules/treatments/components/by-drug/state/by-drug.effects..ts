import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as ByDrugActions from './by-drug.actions';
import { map, mergeMap } from 'rxjs/operators';
import { TreatmentsApiService } from '../../../services/treatments-api.service';
import { IllnessService } from '../../../../../services';
import { NgRedux } from '@angular-redux/store';
import { findSymptomLive } from '../../../../../state/symptoms/symptoms.selectors';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ByDrugEffects {

  byDrugSearchDrugs$ = createEffect(() => this.actions$.pipe(
    ofType(ByDrugActions.searchDrugs),
    mergeMap(({ term, drugType, source }) => this.treatmentsApi.searchDrugsByName(term, drugType, source).pipe(
      map(drugs => ByDrugActions.searchDrugsSuccess({ drugs }))
    )),
  ));

  loadDrugInfo$ = createEffect(() => this.actions$.pipe(
    ofType(ByDrugActions.loadDrugInfo),
    mergeMap(({ productId, cardinality, drugType, ndc, type }) => this.treatmentsApi.loadDrugInfo(productId, drugType, cardinality, ndc).pipe(
      map(drug => ByDrugActions.loadDrugInfoSuccess({ drug }))
    )),
  ));

  searchIllness$ = createEffect(() => this.actions$.pipe(
    ofType(ByDrugActions.searchIllnesses),
    mergeMap(({ term, includeSymptoms }) => this.illnessesApi.searchIllnesses(term).pipe(
      mergeMap(illnesses => {
        const allIllnesses = illnesses.reduce((res, illness) => {
          return illness.childNodes ? [ ...res, ...illness.childNodes ] : [ ...res, illness ];
        }, []);

        if (includeSymptoms) {
          return this.s.select(findSymptomLive(term)).pipe(
            map(symptoms => {
              return [ ...allIllnesses, ...symptoms.map(symptom => ({ name: symptom.symptomID, description: symptom.name })) ];
            })
          );
        } else {
          return of(allIllnesses);
        }
      }),
      map(results => ByDrugActions.searchIllnessesSuccess({ results })),
    )),
  ));

  constructor(private treatmentsApi: TreatmentsApiService,
              private illnessesApi: IllnessService,
              private actions$: Actions,
              private s: NgRedux<State.Root>) { }
}
