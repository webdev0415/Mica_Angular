import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { selectTreatmentSources } from '../../../../../../state/source/source.selectors';
import { selectCurrentTreatmentsRecordType } from '../../../../state/treatments.selectors';

@Component({
  selector: 'mica-drug-review',
  templateUrl: './drug-review.component.html',
  styleUrls: ['./drug-review.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DrugReviewComponent implements OnInit {

  @Input() drugName: string;
  @Input() sourceCtrlArray: FormArray;
  @Input() policyCtrlArray: FormArray;
  @Input() dosageRecommendationCtrl: FormControl;
  @Output() stepperControl: EventEmitter<number> = new EventEmitter<number>();

  sourcesData$: Observable<SourceInfo.SourcesDictionary> = this.store.pipe(select(selectTreatmentSources));
  recordType$: Observable<'illness' | 'symptom' | null> = this.store.pipe(select(selectCurrentTreatmentsRecordType));

  constructor(private store: Store<State.Root>) { }

  ngOnInit() {
  }

}
