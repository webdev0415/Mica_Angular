import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { NgRedux } from '@angular-redux/store';
import { searchIllnesses } from '../state/by-drug.actions';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import SearchValue = Illness.SearchValue;
import { selectIllnessSearchResults } from '../state/by-drug.selectors';
import { insertSymptomSource, insertTreatmentSource, loadTreatmentSources } from '../../../../../state/source/source.actions';
import { selectSymptomSources, selectTreatmentSources } from '../../../../../state/source/source.selectors';
import SourcesDictionary = SourceInfo.SourcesDictionary;
import { combineLatest, map } from 'rxjs/operators';
import { AddedSourcePayload } from '../../../../shared/source-form/source-form.component';
import { postMsg } from '../../../../../state/messages/messages.actions';

@Component({
  selector: 'mica-drug-restrictions-form',
  templateUrl: './drug-restrictions-form.component.html',
  styleUrls: ['./drug-restrictions-form.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DrugRestrictionsFormComponent implements OnInit {
  @Input() drugInfo: Treatments.Drug.GenericSearchModel;

  likelihoodCtrl: FormControl = new FormControl('');
  sourceCtrlArray: FormArray = new FormArray([]);

  illnessSearchResults$: Observable<SearchValue[]> = this.store.select(selectIllnessSearchResults);
  treatmentsSources$: Observable<SourcesDictionary> = this.store.select(selectTreatmentSources);

  constructor(private s: NgRedux<State.Root>,
              private store: Store<any>) { }

  ngOnInit() {
    this.illnessSearchResults$.subscribe(val => console.log(val));
  }

  onSearchIllness(term: string) {
    this.store.dispatch(searchIllnesses({ term, includeSymptoms: true }));
  }

  onSelectSymptom(symptom: any) {
    this.store.dispatch(loadTreatmentSources({ code: symptom, templateType: 'SYMPTOM' }));
  }

  onSelectIllness(illness: any) {
    this.store.dispatch(loadTreatmentSources({ code: illness, templateType: 'ILLNESS' }));
  }

  onSourceAdded({ source, isNew, isExisting }: AddedSourcePayload) {
    if (isNew) {
      this.store.dispatch(insertTreatmentSource({ record: source }));
      this.s.dispatch(postMsg(
        `New source "${source.sourceType}" successfully added to server`,
        { type: 'success' }
      ));

    } else if (isExisting) {
      this.s.dispatch(postMsg(
        `Source "${source.sourceType}" is already added`,
        { type: 'warning' }
      ));

    } else {
      this.store.dispatch(insertTreatmentSource({ record: source }));
      this.s.dispatch(postMsg(
        `Source "${source.sourceType}" successfully added`,
        { type: 'success' }
      ));
    }
  }
}
