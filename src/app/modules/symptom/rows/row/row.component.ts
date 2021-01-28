import { activeIllnessID, currentIllness } from 'app/state/workbench/workbench.selectors';
import { symptomDataPath } from 'app/state/symptoms/symptoms.selectors';
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, Output, EventEmitter,
  OnInit, ElementRef, ViewChild, HostListener
} from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { AbstractControl, FormGroup, FormControl, FormArray } from '@angular/forms';
import { NgRedux } from '@angular-redux/store';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import * as _ from 'lodash';
import { TOGGLE_DESCRIPTOR } from 'app/state/nav/nav.actions';
import { formCtrlErrorTracker } from 'app/util/forms/errors';
import { from } from 'rxjs/observable/from';
import { distinctUntilChanged, skip } from 'rxjs/operators';
import { AddedSourcePayload } from '../../../shared/source-form/source-form.component';
import { insertSymptomSource } from '../../../../state/source/source.actions';
import { postMsg } from '../../../../state/messages/messages.actions';
import { SourceService } from '../../../../services';
import { select, Store } from '@ngrx/store';
import { selectSymptomSources } from '../../../../state/source/source.selectors';

@Component({
  animations: [
    trigger('flyInOut', [
      state('in', style({
        opacity: 1,
        transform: 'translateX(0)'
      })),
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateX(-100%)'
        }),
        animate('0.4s ease-in')
      ]),
      transition(':leave', [
        animate('0.3s ease-out', style({
          opacity: 0,
          transform: 'translateX(-100%)'
        }))
      ])
    ])
  ],
  selector: 'mica-symptom-row',
  templateUrl: './row.component.html',
  styleUrls: ['./row.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SymptomRowComponent implements OnInit, OnDestroy {
  @Input() readonly symptomData: Symptom.Data;
  @Input() readonly dataStoreRefTypes: Workbench.DataStoreRefTypesDictionary;
  @Input() readonly allMultiplierValues: (string | string[] | [number, number])[];
  @Input() readonly removable: boolean;
  @Input() readonly rowIndex: number;
  @Input() rowCtrl: FormGroup;
  @Input() readOnly = false;

  @Output() removeRow: EventEmitter<boolean> = new EventEmitter();
  @Output() errors: EventEmitter<Symptom.RowError | {}> = new EventEmitter();

  @ViewChild('row', { static: true }) rowEl: ElementRef;

  sourcesData$: Observable<SourceInfo.SourcesDictionary> = this.store.pipe(select(selectSymptomSources));

  private subs: Subscription[] = [];
  private errorPublisherSrc: BehaviorSubject<Symptom.RowError> = new BehaviorSubject({index: -1});

  hasBodySelector: boolean;
  categoryName: string;
  hasScale: boolean;
  descriptorFile: string;
  symptomID: string;
  showSource = false;
  timer: any;
  errorPublisher = from(this.errorPublisherSrc);

  constructor(private s: NgRedux<State.Root>,
              private cd: ChangeDetectorRef,
              private store: Store<State.Root>,
              private sourceSvc: SourceService) {
  }

  get multiplierCtrl(): FormGroup {
    return this.rowCtrl && <FormGroup>this.rowCtrl.get('multiplier');
  }

  get biasCtrl(): FormGroup {
    return this.rowCtrl && <FormGroup>this.rowCtrl.get('bias');
  }

  get sourceInfoCtrl(): FormArray {
    return this.rowCtrl && <FormArray>this.rowCtrl.get('sourceInfo');
  }

  get likelihoodCtrl(): FormGroup {
    return this.rowCtrl && <FormGroup>this.rowCtrl.get('likelihood');
  }

  get modifierValuesCtrl(): FormGroup {
    return this.rowCtrl && <FormGroup>this.rowCtrl.get('modifierValues');
  }

  get horizontalFit(): string {
    const row = this.rowEl.nativeElement;
    return row.clientWidth <= 900 ? 'vertical' : 'horizontal';
  }

  get multiplierDataStore(): Workbench.DataStoreRefType | null {
    const multiplierName = this.symptomData.multipleValues;
    return multiplierName ? this.dataStoreRefTypes[multiplierName] : null
  }

  get multiplierValue() {
    const multiplierCtrl = this.multiplierCtrl;

    return multiplierCtrl ? multiplierCtrl.value : [];
  }

  ngOnInit() {
    const model = this.symptomData.symptomsModel;

    this.hasBodySelector = this.symptomData.multipleValues
      ? !!~_.indexOf(this.state.symptoms.bodySelectorMultipliers, this.symptomData.multipleValues)
      : false;
    this.hasScale = !!~_.indexOf(model.dataStoreTypes, 'TimeUnit');
    this.descriptorFile = model.descriptorFile || '';
    this.symptomID = this.symptomData.symptomID;

    if (!this.sourceInfoCtrl) {
      this.rowCtrl.addControl('sourceInfo', new FormControl([]));
    }

    if (!this.biasCtrl) {
      console.error('Please revise row controls.', this.likelihoodCtrl, this.biasCtrl);
      return;
    }

    this.addErrorTrackers(this.likelihoodCtrl, this.multiplierCtrl);
    this.categoryName = symptomDataPath(this.symptomData.symptomID)(this.state).categoryName;

    this.subs.push(
      this.errorPublisher.pipe(
        distinctUntilChanged((x, y) => _.isEqual(x, y)),
        skip(1)
      ).subscribe(this.onPublishError.bind(this)),

      formCtrlErrorTracker('bias', this.biasCtrl, this.errorPublisherSrc)
    );
  }

  ngOnDestroy() {
    _.each(this.subs, s => s.unsubscribe());
    this.timer && clearTimeout(this.timer);
  }

  onMultiplierSelect(value: string[]) {
    const multiplierCtrl = this.rowCtrl.get('multiplier');
    if (!multiplierCtrl) return;
    multiplierCtrl.setValue(value);
  }

  onToggleDescriptor() {
    this.s.dispatch({
      type: TOGGLE_DESCRIPTOR,
      illness: activeIllnessID(this.state),
      symptom: this.symptomID,
      row: this.rowIndex
    });
  }

  onModifierErrors(errors: Symptom.ModifierError[]): void {
    this.errorPublisherSrc.next(errors.length
      ? {...this.errorPublisherSrc.value, modifierValues: errors}
      : _.omit(this.errorPublisherSrc.value, 'modifierValues') as Symptom.RowError);
  }

  onSourceAdded({ source, isNew, isExisting }: AddedSourcePayload) {
    if (isNew) {
      this.store.dispatch(insertSymptomSource({ record: source }));
      this.s.dispatch(postMsg(
        `New symptom source: "${source.sourceType}" successfully added to server`,
        { type: 'success' }
      ));

    } else if (isExisting) {
      this.s.dispatch(postMsg(
        `The source: "${source.sourceType}" is already added to the symptom`,
        { type: 'warning' }
      ));

    } else {
      this.store.dispatch(insertSymptomSource({ record: source }));
      this.s.dispatch(postMsg(
        `Symptom source: "${source.sourceType}" successfully added to the symptom`,
        { type: 'success' }
      ));
    }
  }

  removeSource({ idx, source, action }: { idx: number, source: SourceInfo.Source, action: SourceInfo.Action }) {
    const symptomID = this.symptomID;
    const illness = <Illness.Normalized.IllnessValue>currentIllness(this.state);
    let payload: SourceInfo.RemovePayload;

    if (!illness) {
      this.s.dispatch(postMsg(
        `Can't determine current illness`,
        { type: 'error' }
      ));

      return;
    }

    const illnessForm = illness.form;

    payload = {
      icd10Code: illnessForm.idIcd10Code,
      version: illnessForm.version,
      state: illnessForm.state,
      symptomID,
      symptomSources: []
    };

    if (action === 'Illness' || action === 'Symptom') {
      const entity: SourceInfo.SymptomSource = { sourceInfo: [] };
      const multiplierCtrl = this.multiplierCtrl;
      const multiplier = multiplierCtrl && multiplierCtrl.value;

      if (multiplier) entity.multiplier = multiplier[0];

      entity.sourceInfo.push({ sourceID: <number>source.sourceID, action });
      (<SourceInfo.SymptomSource[]>payload.symptomSources).push(entity);
      this.sourceSvc.removeSymptomSource(payload).subscribe(res => {
        this.sourceInfoCtrl.removeAt(idx);
        this.cd.detectChanges();
        this.s.dispatch(postMsg(
          `Source "${source.sourceType}" was successfully removed from ${this.symptomData.name} ${action}`,
          { type: 'success' },
        ));
      });

    }
  }

  private get state() {
    return this.s.getState();
  }

  @HostListener('window:resize')
  private onResize = () => this.cd.detectChanges();

  private onPublishError(rowError: Symptom.RowError) {
    this.errors.emit(_.keys(rowError).length > 1 ? rowError : {});
  }

  private addErrorTrackers(likelihoodCtrl: AbstractControl | null, multiplierCtrl: AbstractControl | null) {
    if (!likelihoodCtrl && !this.hasScale) {
      console.error('Please revise non modifier controls');
      return;
    } else if (likelihoodCtrl) {
      this.subs.push(formCtrlErrorTracker('likelihood', likelihoodCtrl, this.errorPublisherSrc));
    }

    if (multiplierCtrl) {
      this.subs.push(formCtrlErrorTracker('multiplier', multiplierCtrl, this.errorPublisherSrc));
      this.timer = setTimeout(() => multiplierCtrl.updateValueAndValidity(), 1);
    }
  }

  checkBoxChange(controlName: string) {
    const cntrlValue = this.rowCtrl.controls[controlName].value;
    if (controlName === 'ruleOut' && cntrlValue) {
      this.rowCtrl.controls['minDiagCriteria'].setValue(false);
      this.rowCtrl.controls['medNecessary'].setValue(false);
      this.rowCtrl.controls['must'].setValue(false);
    } else if ((controlName === 'minDiagCriteria' || controlName === 'medNecessary' || controlName === 'must') && cntrlValue) {
      this.rowCtrl.controls['ruleOut'].setValue(false);
    }
  }

}
