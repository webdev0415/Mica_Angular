import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as SourcesActions from './source.actions';
import { map, mergeMap } from 'rxjs/operators';
import { SourceService } from '../../services';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SourceEffects {

  loadTreatmentTypes$ = createEffect(() => this.actions$.pipe(
    ofType(SourcesActions.loadTreatmentSources),
    mergeMap(({ code, templateType }) => {

      if (code && templateType) {
        return this.sourcesApi.getTreatmentSourcesByCode(code, templateType).pipe(
          map(records => SourcesActions.loadTreatmentSourcesSuccess({ records }))
        );

      } else {
        return of(SourcesActions.loadTreatmentSourcesSuccess({ records: [] }));
      }
    }),
  ));

  // TODO: finish to implement source operations through effects
  // addTreatmentSource = createEffect(() => this.actions$.pipe(
  // ));

  constructor(private sourcesApi: SourceService,
              private actions$: Actions) { }
}
