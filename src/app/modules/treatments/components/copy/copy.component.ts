import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Output,
  EventEmitter
} from '@angular/core';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { setActiveTreatmentsRecord } from '../../state/treatments.actions';
import { select, Store } from '@ngrx/store';
import { selectCurrentTreatmentsRecord } from '../../state/treatments.selectors';

@Component({
  selector: 'treatments-copy',
  templateUrl: './copy.component.html',
  styleUrls: ['./copy.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CopyComponent implements OnInit {
  @Output() close: EventEmitter<boolean> = new EventEmitter();

  newRecord: Observable<Treatments.Record.New> = of();
  currentRecord: Observable<State.CurrentTreatmentRecord> = this.store.pipe(select(selectCurrentTreatmentsRecord));
  newRecordName: Observable<string>;
  searchRecord: Treatments.Record.New;

  constructor(private store: Store<State.Root>) { }

  ngOnInit() {
    this.newRecordName = this.newRecord
      .pipe(
        filter(r => !!r),
        map(r => r.icd10Code || r.symptomID || '')
      );
  }

  onRecordChange(search: Treatments.Search) {
    if (search.record && search.record.treatments && search.record.treatments.length) {
      this.searchRecord = search.record
    }
  }

  onConfirmMerge() {
    this.currentRecord.toPromise().then(({ record, isNew }) => {
      const newRecord = record ? {
        ...record,
        treatments: this.searchRecord.treatments
      } : null;

      this.store.dispatch(setActiveTreatmentsRecord({
        record: newRecord,
        isNew
      }));
      this.close.emit(true);
    });
  }

}
