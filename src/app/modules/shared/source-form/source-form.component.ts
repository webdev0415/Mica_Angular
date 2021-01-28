import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  OnDestroy,
  ChangeDetectorRef, SimpleChanges, OnChanges, Output, EventEmitter
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { SourceService } from '../../../services';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { Observable, Subscription, throwError } from 'rxjs';
import { of } from 'rxjs/internal/observable/of';
import { SourceRemovalModalComponent } from './source-removal-modal/source-removal-modal.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

export interface AddedSourcePayload {
  source: SourceInfo.Source,
  isNew?: boolean,
  isExisting?: boolean
}

@Component({
  selector: 'mica-source-form',
  templateUrl: './source-form.component.html',
  styleUrls: ['./source-form.component.sass'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class SourceFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() recordType: 'symptom' | 'illness';
  @Input() treatmentType: 'drug' | 'non-drug';
  @Input() entityType: 'treatment' | 'record';
  @Input() sourceCtrlArray: FormArray;
  @Input() sourcesData: SourceInfo.SourcesDictionary;
  @Input() readOnly = false;
  @Input() noSourceRemovalOptions = false;
  @Input() allowNewView = false;

  @Output() sourceAdded: EventEmitter<AddedSourcePayload> = new EventEmitter();
  @Output() sourceRemoved: EventEmitter<{ idx: number, source: SourceInfo.Source, action?: SourceInfo.Action }> = new EventEmitter();

  isSavingData = false;
  suggestions: SourceInfo.Source[];
  sourceCtrl: FormControl = this.fb.control('', [ Validators.minLength(3), Validators.required ]);
  sourceAutoCtrl: FormControl = this.fb.control('', [ Validators.minLength(3), Validators.required ]);
  sourceTypeCtrl: FormControl = this.fb.control('', [ Validators.required ]);
  sourceIDCtrl: FormControl = this.fb.control(null);

  displayedColumns: string[] = ['remove', 'source', 'addedBy'];

  private subs: Subscription[] = [];

  constructor(private fb: FormBuilder,
              private sourceSvc: SourceService,
              private cd: ChangeDetectorRef,
              private modalSvc: NgbModal) { }

  get sourcesInfoTypes(): SourceInfo.SourceInfoType[] {
    return this.sourceCtrlArray && this.sourceCtrlArray.value;
  }

  ngOnInit() {
    if (this.allowNewView) {
      this.subs.push(
        this.sourceAutoCtrl.valueChanges.pipe(
          tap(() => this.sourceIDCtrl.reset()),
          filter(this.isSourceValid.bind(this)),
          debounceTime(500),
          switchMap(this.liveSearchSources)
        ).subscribe(this.setSuggestions.bind(this)),

        this.sourceAutoCtrl.valueChanges.pipe(
          tap(val => typeof val === 'string' && this.sourceCtrl.setValue(val)),
          filter(val => typeof val !== 'string'),
        ).subscribe(this.onSelectSource.bind(this)),
      );

    } else {
      this.subs.push(
        this.sourceCtrl.valueChanges.pipe(
          distinctUntilChanged(),
          tap(() => this.sourceIDCtrl.reset()),
          filter(this.isSourceValid.bind(this)),
          debounceTime(500),
          switchMap(this.liveSearchSources)
        ).subscribe(this.setSuggestions.bind(this)),
      );
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const { entityType } = changes;
    let searchFn: (term: string) => Observable<SourceInfo.Source[]> = () => of();
    let addSourceToServerFn: (source: SourceInfo.Source) => Observable<SourceInfo.Source> = () => of();

    if (!entityType || entityType.currentValue === entityType.previousValue) return;

    switch (this.entityType) {
      case 'treatment':
        searchFn = this.sourceSvc.searchTreatmentSources.bind(this.sourceSvc);
        addSourceToServerFn = this.sourceSvc.addTreatmentSource.bind(this.sourceSvc);
        break;
      case 'record':
        searchFn = this.sourceSvc.searchSymptomSources.bind(this.sourceSvc);
        addSourceToServerFn = this.sourceSvc.addSymptomSource.bind(this.sourceSvc);
        break;
    }

    this.setLiveSearchFn(searchFn);
    this.setAddSourceToServerFn(addSourceToServerFn);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  getSourceData(id: number) {
    return this.sourcesData && this.sourcesData[id];
  }

  getVerifiedCtrl(idx: number): FormControl {
    return <FormControl>this.sourceCtrlArray.at(idx).get('verified');
  }

  onSelectSource(sourceInfo: SourceInfo.Source) {
    this.sourceCtrl.setValue(sourceInfo.source, { emitEvent: false });
    this.sourceTypeCtrl.setValue(sourceInfo.sourceType, { emitEvent: false });
    this.sourceIDCtrl.setValue(sourceInfo.sourceID, { emitEvent: false });
    this.hideAutoCompete();
  }

  onAddSourceClick() {
    this.addToSources({
      source: this.sourceCtrl.value,
      sourceType: this.sourceTypeCtrl.value,
      sourceID: this.sourceIDCtrl.value,
      sourceTitle: '',
      rank: 0,
    });

    this.sourceCtrl.reset();
    this.sourceTypeCtrl.reset();
    this.sourceIDCtrl.reset();
  }

  hideAutoCompete() {
    this.setSuggestions([]);
  }

  removeSource(idx: number) {
    const sourceID = this.sourceCtrlArray.at(idx).value.sourceID;
    const sourceData = this.sourcesData[sourceID];
    let modalRef: NgbModalRef;

    if (this.noSourceRemovalOptions) {
      this.removeSourceLocal(idx, sourceData);
      return;
    }

    modalRef = this.modalSvc.open(SourceRemovalModalComponent);
    modalRef.componentInstance.entityType = this.entityType;
    modalRef.componentInstance.recordType = this.recordType;
    modalRef.componentInstance.treatmentType = this.treatmentType;
    modalRef.result
      .then((res: any) => {
        if (res === 'treatment') {
          this.removeSourceFromTreatment(idx, sourceData, true);
        } else if (res === 'drug' || res === 'non-drug') {
          this.removeSourceFromTreatment(idx, sourceData);
        } else if (res === 'symptom') {
          this.removeSourceFromSymptom(idx, sourceData);
        } else if (res === 'illness') {
          this.removeSourceFromIllness(idx, sourceData);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  displayWithFn(value: SourceInfo.Source): string {
    return value.source;
  }

  private removeSourceFromIllness(idx: number, source: SourceInfo.Source) {
    this.sourceRemoved.next({ idx, source, action: 'Illness' });
  }

  private removeSourceFromSymptom(idx: number, source: SourceInfo.Source) {
    this.sourceRemoved.next({ idx, source, action: 'Symptom' });
  }

  private removeSourceFromTreatment(idx: number, source: SourceInfo.Source, full = false) {
    const action = full ? 'Treatment' : 'Drug/NonDrug';

    this.sourceRemoved.next({ idx, source, action });
  }

  private removeSourceLocal(idx: number, source: SourceInfo.Source) {
    this.sourceRemoved.next({ idx, source });
  }

  private addNewSourceCtrl(sourceInfo: SourceInfo.Source) {
    const newSourceCtrl = this.fb.group({
      sourceID: sourceInfo.sourceID,
      addedBy: 'Doctor',
      enabled: true,
      verified: true,
      sourceRefDate: null,
    });

    this.sourceCtrlArray.push(newSourceCtrl);
    this.cd.detectChanges();
  }

  private addToSources(sourceData: SourceInfo.Source) {
    const { sourceType, source, sourceID } = sourceData;

    if (!source) {
      return;
    }

    this.isSavingData = true;

    if (Number.isInteger(<any>sourceID) && this.isExistingSourceId(<number>sourceID)) {
      this.sourceAdded.next({
        source: sourceData,
        isExisting: true
      });
      this.isSavingData = false;

    } else if (Number.isInteger(<any>sourceID)) {
      this.addNewSourceCtrl(sourceData);
      this.sourceAdded.next({
        source: sourceData
      });
      this.isSavingData = false;

    } else {
      this.addSourceToServer({ source, sourceType } as SourceInfo.Source).subscribe(
        (newSource: SourceInfo.Source) => {
          this.addNewSourceCtrl(newSource);
          this.sourceAdded.next({
            source: newSource,
            isNew: true
          });
          this.isSavingData = false;
        },
      );
    }
  }

  private isExistingSourceId(sourceID: number): boolean {
    const sources: SourceInfo.SourceInfoType[] = this.sourceCtrlArray.value;

    return sources.some(s => s.sourceID === sourceID);
  }

  private setLiveSearchFn(fn: (term: string) => Observable<SourceInfo.Source[]>) {
    this.liveSearchSources = fn;
  }

  private liveSearchSources: (term: string) => Observable<SourceInfo.Source[]> = () => {
    return throwError(new Error('liveSearchSources method is not set'));
  };

  private setAddSourceToServerFn(fn: (source: SourceInfo.Source) => Observable<SourceInfo.Source>) {
    this.addSourceToServer = fn;
  }

  private addSourceToServer: (source: SourceInfo.Source) => Observable<SourceInfo.Source> = () => {
    return throwError(new Error('addSourceToServer method is not set'));
  };

  private setSuggestions(sources: SourceInfo.Source[]) {
    this.suggestions = sources;
    this.cd.detectChanges();
  }

  private isSourceValid(value: string | SourceInfo.Source) {
    if (this.allowNewView) {
      if (typeof value === 'string' && this.sourceAutoCtrl.valid) {
        return true;
      }
    } else {
      if (value && this.sourceCtrl.valid) {
        return true;
      }
    }

    this.hideAutoCompete();
    return false;
  }
}
