import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { loadDrugInfo, resetDrugSearchResults, resetStore, searchDrugs } from './state/by-drug.actions';
import { selectActiveDrugInfo, selectDrugSearchResults } from './state/by-drug.selectors';

@Component({
  selector: 'mica-by-drug',
  templateUrl: './by-drug.component.html',
  styleUrls: ['./by-drug.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ByDrugComponent implements OnInit, OnDestroy {
  drugSearchResults$: Observable<Treatments.Drug.Short[]> = this.store.pipe(select(selectDrugSearchResults));
  activeDrugInfo$: Observable<Treatments.Drug.GenericSearchModel | null> = this.store.pipe(select(selectActiveDrugInfo));

  private destroy$: Subject<void> = new Subject<void>();

  constructor(private store: Store<any>) { }

  ngOnInit() {
  }

  searchDrugs(params: { term: string, drugType: Treatments.Drug.DrugType, source?: Treatments.Drug.SearchSource }) {
    if (params.term) {
      this.store.dispatch(searchDrugs(params));
    } else {
      this.store.dispatch(resetDrugSearchResults());
    }
  }

  loadDrugInfo(params: { productId: string, drugType: Treatments.Drug.DrugType, cardinality: Treatments.Drug.Cardinality, ndc: boolean }) {
    this.store.dispatch(loadDrugInfo(params));
  }

  ngOnDestroy() {
    this.store.dispatch(resetStore());

    this.destroy$.next();
    this.destroy$.complete();
  }

}
