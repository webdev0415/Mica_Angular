import { Component, ChangeDetectionStrategy } from '@angular/core';
import { setActiveTreatmentsRecord } from '../../state/treatments.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'treatments-record-selector',
  templateUrl: './record-selector.component.html',
  styleUrls: ['./record-selector.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecordSelectorComponent {

  constructor(private store: Store<State.Root>) { }

  onRecordChange(search: Treatments.Search) {
    this.store.dispatch(setActiveTreatmentsRecord({
      record: search.record,
      isNew: search.new || false
    }));
  }

}
