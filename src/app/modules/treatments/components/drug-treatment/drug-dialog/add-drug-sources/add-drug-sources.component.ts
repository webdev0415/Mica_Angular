import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { AddedSourcePayload } from '../../../../../shared/source-form/source-form.component';
import { insertTreatmentSource } from '../../../../../../state/source/source.actions';
import { postMsg } from '../../../../../../state/messages/messages.actions';
import { select, Store } from '@ngrx/store';
import { NgRedux } from '@angular-redux/store';
import { FormArray } from '@angular/forms';
import { Observable } from 'rxjs';
import { selectTreatmentSources } from '../../../../../../state/source/source.selectors';
import { selectCurrentTreatmentsRecordType } from '../../../../state/treatments.selectors';

@Component({
  selector: 'mica-add-drug-sources',
  templateUrl: './add-drug-sources.component.html',
  styleUrls: ['./add-drug-sources.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddDrugSourcesComponent {
  @Input() sourceCtrlArray: FormArray;
  @Input() drugName: string;

  sourcesData$: Observable<SourceInfo.SourcesDictionary> = this.store.pipe(select(selectTreatmentSources));
  recordType$: Observable<'illness' | 'symptom' | null> = this.store.pipe(select(selectCurrentTreatmentsRecordType));

  constructor(private store: Store<State.Root>,
              private s: NgRedux<State.Root>) { }

  onSourceAdded({ source, isNew, isExisting }: AddedSourcePayload) {
    if (isNew) {
      this.store.dispatch(insertTreatmentSource({ record: source }));
      this.s.dispatch(postMsg(
        `New treatment source: "${source.sourceType}" successfully added to server`,
        { type: 'success' }
      ));

    } else if (isExisting) {
      this.s.dispatch(postMsg(
        `The source: "${source.sourceType}" is already added to the drug`,
        { type: 'warning' }
      ));

    } else {
      this.store.dispatch(insertTreatmentSource({ record: source }));
      this.s.dispatch(postMsg(
        `Treatment source: "${source.sourceType}" successfully added to the drug`,
        { type: 'success' }
      ));
    }
  }

  onSourceRemoved({ idx, source }: { idx: number, source: SourceInfo.Source }) {
    this.sourceCtrlArray.removeAt(idx);
  }

}
