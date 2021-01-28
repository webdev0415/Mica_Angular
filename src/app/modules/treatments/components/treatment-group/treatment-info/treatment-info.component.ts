import { Component, OnInit, ChangeDetectionStrategy, Input, AfterViewInit, SimpleChanges } from '@angular/core';
import Description = Treatments.Drug.Description;
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { selectTreatmentSources } from '../../../../../state/source/source.selectors';
import { selectCurrentTreatmentsRecordType } from '../../../state/treatments.selectors';
import { FormArray, FormBuilder } from '@angular/forms';

@Component({
  selector: 'mica-treatment-info',
  templateUrl: './treatment-info.component.html',
  styleUrls: ['./treatment-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class TreatmentInfoComponent implements AfterViewInit {

  @Input() treatment: Description;

  sourcesData$: Observable<SourceInfo.SourcesDictionary> = this.store.pipe(select(selectTreatmentSources));
  recordType$: Observable<'illness' | 'symptom' | null> = this.store.pipe(select(selectCurrentTreatmentsRecordType));

  viewAlt = false;

  sources: FormArray;

  constructor(private store: Store<State.Root>, private fb: FormBuilder) { }

  ngOnChanges({ treatment }: SimpleChanges) {
    treatment && this.treatment && (this.sources = this.fb.array(this.treatment.sourceInfo));
  }

  ngAfterViewInit() {
  }

  isDosagePresent(): boolean {
    return !_.isEmpty(this.treatment.dosageRecommendation);
  }

  policiesPresent(): boolean {
    return !_.isEmpty(this.treatment.policies);
  }

  checkForAlts() {
    if ('policies' in this.treatment) {
      // @ts-ignore
      return this.treatment.policies.find(x => x.alternative);
    } else {
      return false
    }
  }

}
