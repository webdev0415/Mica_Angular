import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { FormArray } from '@angular/forms';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { selectTreatmentSources } from '../../../../../../state/source/source.selectors';
import { selectCurrentTreatmentsRecordType } from '../../../../state/treatments.selectors';

@Component({
  selector: 'mica-non-drug-review',
  templateUrl: './non-drug-review.component.html',
  styleUrls: ['./non-drug-review.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NonDrugReviewComponent implements OnInit {

  @Input() nonDrugName: string;
  @Input() sourceCtrlArray: FormArray;
  @Output() stepperControl: EventEmitter<number> = new EventEmitter<number>();

  sourcesData$: Observable<SourceInfo.SourcesDictionary> = this.store.pipe(select(selectTreatmentSources));
  recordType$: Observable<'illness' | 'symptom' | null> = this.store.pipe(select(selectCurrentTreatmentsRecordType));

  constructor(private store: Store<State.Root>) { }

  ngOnInit() {
  }

}
