import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { NgRedux } from '@angular-redux/store';
import * as _ from 'lodash';
import { TreatmentsApiService } from '../../services/treatments-api.service';
import {
  loadTreatmentTypes,
  setActiveTreatmentsRecord
} from 'app/modules/treatments/state/treatments.actions';
import { symptomData } from 'app/state/symptoms/symptoms.selectors';
import { distinctUntilChanged, filter, map, pluck, take } from 'rxjs/operators';
import { illnessByIcd10Code } from 'app/state/illnesses/illnesses.selectors';
import { postMsg } from 'app/state/messages/messages.actions';
import { loadTreatmentSources } from '../../../../state/source/source.actions';
import { select, Store } from '@ngrx/store';
import {
  selectCurrentTreatmentsRecord,
  selectShowTreatmentsValidation,
  selectDrugTemplates,
  selectNonDrugTemplates
} from '../../state/treatments.selectors';

@Component({
  selector: 'mica-by-illness',
  templateUrl: './by-illness.component.html',
  styleUrls: ['./by-illness.component.sass'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ByIllnessComponent implements OnInit, OnDestroy {
  currentRecord$: Observable<State.CurrentTreatmentRecord> = this.store.pipe(select(selectCurrentTreatmentsRecord));
  showValidation$: Observable<boolean> = this.store.pipe(select(selectShowTreatmentsValidation));
  drugTableTemplates$: Observable<Treatments.Types.Template[]> = this.store.pipe(select(selectDrugTemplates));
  nonDrugTableTemplates$: Observable<Treatments.Types.Template[]> = this.store.pipe(select(selectNonDrugTemplates));
  submitting = false;
  copyActive = false;
  activeRecordCode$: Observable<string>;
  activeRecordName$: Observable<string>;

  activeTabName = '';
  activeTreatmentTemplate: Treatments.Types.Template;

  private defaultTemplate: Treatments.Types.Template;
  private subs: Subscription[] = [];

  get state() {
    return this.s.getState();
  }

  get isDrugTab(): boolean {
    return (this.activeTabName === 'Prescription Drugs') || (this.activeTabName === 'OTC Drugs');
  }

  constructor(private s: NgRedux<State.Root>,
              private store: Store<State.Root>,
              private treatmentSvc: TreatmentsApiService) {
  }

  ngOnInit() {
    this.loadTableTemplates();
    this.activeRecordCode$ = this.currentRecord$
      .pipe(
        pluck('record'),
        map(this.processNewRecord.bind(this))
      );
    this.activeRecordName$ = this.currentRecord$
      .pipe(
        pluck('record'),
        filter(this.valueExists),
        pluck('name')
      );

    this.subs.push(
      this.currentRecord$
        .pipe(
          pluck('record'),
          distinctUntilChanged((prev, cur) => {
            if (prev === cur) return true;

            if (!prev || !cur) return false;

            return (
              (prev.icd10Code === cur.icd10Code) &&
              (prev.symptomID === cur.symptomID)
            );
          })
        )
        .subscribe(record => {
          const id = record && (record.icd10Code || record.symptomID);
          const type = record && ((record.icd10Code && 'ILLNESS') || (record.symptomID && 'SYMPTOM'));

          this.loadSourcesForTemplate(id || null, type || null);
        })
    );
  }

  trackTable(index: number, table: Treatments.Types.Template): number {
    return table.typeID;
  }

  ngOnDestroy() {
    _.each(this.subs, s => s.unsubscribe());
  }

  getGroupsForTemplate(templateName: string): Observable<Treatments.NonDrug.Group[] | Treatments.Drug.Group[]> {
    return this.currentRecord$.pipe(take(1), map(currentRecord => {
      const treatments = currentRecord && currentRecord.record && currentRecord.record.treatments;
      const treatment = treatments && treatments.find(x => x.name === templateName);

      return treatment && treatment.groups || [];
    }));
  }

  onCancel() {
    this.store.dispatch(setActiveTreatmentsRecord({
      record: null,
      isNew: false
    }));
    this.activeTabName = 'Prescription Drugs';
    this.activeTreatmentTemplate = this.defaultTemplate;
  }

  onTreatmentChange(msg: string) {
    this.saveRecord(msg);
  }

  get postAction(): Observable<string> {
    return this.currentRecord$.pipe(
      take(1),
      map(currentRecord => {
        if (!currentRecord.record) return '';

        return currentRecord.isNew
          ? 'CREATE RECORD FOR ' + (currentRecord.record.icd10Code || currentRecord.record.symptomID)
          : 'SAVE';
      })
    );
  }

  private setActive(tpl: Treatments.Types.Template) {
    if (!tpl) return;

    this.activeTabName = tpl.name;
    this.activeTreatmentTemplate = tpl;
  }

  private processNewRecord(record: Treatments.Record.New) {
    if (record == null || undefined) return '';

    if (!!record.symptomID) {
      const symptom = symptomData(record.symptomID)(this.state);

      if (symptom && symptom.name) {
        return `${record.symptomID} - ${symptom.name}`;
      }

      return record.symptomID;
    }

    if (!!record.icd10Code) {
      const illnessName = (illnessByIcd10Code(record.icd10Code)(this.state)).name;

      if (illnessName) {
        return `${record.icd10Code} - ${illnessName}`
      }

      return record.icd10Code;
    }

    return '';
  }

  private valueExists = (r: any) => !!r;

  private saveRecord(msg: string) {
    this.currentRecord$.pipe(take(1)).subscribe(currentRecord => {
      let treatments = currentRecord.record && currentRecord.record.treatments;

      if (currentRecord.record) {
        treatments = currentRecord.record.treatments.reduce(
          (treatmentsRes: any[], t: any) => {
            const groups = (<any[]>t.groups).reduce(
              (groupsRes: any[], g: any) => {
                let group = g;

                if (g.drugs) {
                  const descs = g.drugs.reduce(
                    (res: Treatments.Drug.Description[], d: Treatments.Drug.Description) => {
                      if (d.sourceInfo && d.sourceInfo.length) res.push(d);

                      return res;
                    },
                    []
                  );

                  group = {...g, drugs: descs};

                } else if (g.nonDrugs) {
                  const descs = g.nonDrugs.reduce(
                    (res: Treatments.NonDrug.Description[], d: Treatments.NonDrug.Description) => {
                      if (d.sourceInfo && d.sourceInfo.length) res.push(d);

                      return res;
                    },
                    []
                  );

                  group = { ...g, nonDrugs: descs };
                }

                groupsRes.push(group);

                return groupsRes;
              },
              []
            );

            treatmentsRes.push({...t, groups});

            return treatmentsRes;
          },
          []);
      } else {
        return;
      }

      this.treatmentSvc.saveRecord({ ...currentRecord.record, treatments }).pipe(take(1)).subscribe(() => {
        msg && this.s.dispatch(postMsg(
          msg,
          { type: 'success' },
        ));
      });
    });
  }

  /**
   * Used on first load and every time a new template is added by user
   */
  private loadTableTemplates(): void {
    this.store.dispatch(loadTreatmentTypes());
  }

  private loadSourcesForTemplate(code: string | null, templateType: SourceInfo.TemplateType | null) {
    this.store.dispatch(loadTreatmentSources({ code, templateType }));
  }

}
