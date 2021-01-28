import { findSymptomLive } from 'app/state/symptoms/symptoms.selectors';
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  HostListener
} from '@angular/core';
import {
  FormControl,
  Validators
} from '@angular/forms';
import { NgRedux } from '@angular-redux/store';
import { BehaviorSubject, Subscription, Observable, throwError } from 'rxjs';
import * as _ from 'lodash';
import { TreatmentsApiService } from '../../services/treatments-api.service';
import { catchError, debounceTime, finalize, take } from 'rxjs/operators';
import { IllnessService } from 'app/services';
import { selectCurrentTreatmentsRecord } from '../../state/treatments.selectors';
import { select, Store } from '@ngrx/store';
import { setActiveTreatmentsRecord } from '../../state/treatments.actions';
import CurrentTreatmentRecord = State.CurrentTreatmentRecord;

@Component({
  selector: 'mica-treatment-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreatmentsSearchComponent implements OnInit, OnDestroy {
  @Input() size: '' | 'large' = '';
  @Input() selector = false;
  @Output() record: EventEmitter<Treatments.Search> = new EventEmitter;
  @ViewChild('input', { static: false })
  inputRef: ElementRef;
  @ViewChild('ul', { static: false })
  ulRef: ElementRef;
  searchCtrl = new FormControl('', Validators.required);
  searching = false;
  noRecordFound = false;
  hasBackendError = false;
  searchResults: BehaviorSubject<MICA.SelectableEl[]> = new BehaviorSubject([]);
  searchTryIllness = false;
  focusOnSearch = false;
  private currentRecord: Observable<CurrentTreatmentRecord> = this.store.pipe(select(selectCurrentTreatmentsRecord));
  private searchSub: Subscription;
  private subs: Subscription[] = [];
  private get state() { return this.s.getState(); }

  constructor(private s: NgRedux<State.Root>,
              private store: Store<State.Root>,
              private treatmentSvc: TreatmentsApiService,
              private cd: ChangeDetectorRef,
              private elementRef: ElementRef,
              private illnessService: IllnessService) {
  }

  ngOnInit() {
    if (this.selector) {
      this.currentRecord.pipe(take(1)).subscribe(currentRecord => {
        const activeIllness = currentRecord && currentRecord.record;

        if (activeIllness) this.searchCtrl.setValue(activeIllness.icd10Code);
      });
    }
    this.searchSub = this._searchSub;
  }

  ngOnDestroy() {
    _.each(this.subs, s => s.unsubscribe());
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: any) {
    const targetElem = event.target;
    const input = this.inputRef.nativeElement;
    const ul = this.ulRef.nativeElement;

    if (!(targetElem === input || targetElem.parentNode === ul)) {
      this.focusOnSearch = false;
    }
  }

  get _searchSub() {
    return this.searchCtrl.valueChanges
      .pipe(
        debounceTime(100)
      )
      .subscribe(this.onSearchCtrlChange.bind(this));
  }

  onClose() {
    this.searchCtrl.setValue('');
    this.searchTryIllness = false;
    const input = this.inputRef.nativeElement;
    input.focus();
    this.focusOnSearch = true;
  }

  onSearchByIcon() {
    if (this.searchResults.value.length === 1) {
      this.onSearch(this.searchResults.value[0].value);
    } else if (this.searchCtrl.value && this.searchCtrl.value.length >= 3) {
      this.searchCtrl.setValue(this.searchCtrl.value);
    }
  }


  onSearch(searchValue: string) {
    let valueTrimmed = searchValue.trim().toUpperCase();
    const isSymptom = /SYMPT/i.test(valueTrimmed);

    this.focusOnSearch = false;
    this.noRecordFound = false;
    this.hasBackendError = false;

    // check whether search term matches any items in the dropdown
    // set valueTrimmed to "" if not match, in order to prevent search

    if (!valueTrimmed) {
      this.record.emit({record: null, new: true})
    } else {
      const searchResults = this.searchResults.value;
      const matchedResult = searchResults.find(result => result.name.toUpperCase() === valueTrimmed
        || result.value.toUpperCase() === valueTrimmed);
      valueTrimmed = matchedResult ? matchedResult.value : '';
    }
    if (!valueTrimmed) {
      this.store.dispatch(setActiveTreatmentsRecord({ record: null, isNew: true }));
      this.record.emit({record: null, new: true})
    } else {
      this.searching = true;
      this.searchTryIllness = false;
      this.treatmentSvc.getRecordFor(valueTrimmed)
        .pipe(
          finalize(() => {
            this.searching = false;
            this.searchSub.unsubscribe();
            this.searchCtrl.setValue(valueTrimmed);
            this.searchSub = this._searchSub;
            this.cd.markForCheck();
          }),
          catchError((error: MICA.BasicError) => {
            this.hasBackendError = true;

            return throwError(error);
          })
        )
        .subscribe(record => {
          let isNew = false;

          if (!record) {
            record = <Treatments.Record.New>{
              icd10Code: isSymptom ? undefined : valueTrimmed,
              symptomID: isSymptom ? valueTrimmed : undefined,
              treatments: []
            };
            isNew = true;
          }

          this.store.dispatch(setActiveTreatmentsRecord({
            record,
            isNew
          }));
          this.record.emit({ record, new: isNew });
        });
    }
  }

  private onSearchCtrlChange(term: string) {
    term = term.toUpperCase();
    this.focusOnSearch = true;

    const isSymptom = /SYM/i.test(term);

    if (term.length < 3) {
      this.onSearch('');
      this.searchResults.next([]);

      return;
    }
    const foundSymptoms = _.map(findSymptomLive(term)(this.state), s => {
      return {name: s.name, value: s.symptomID}
    });
    if (isSymptom) {
      this.setSearchResults(true, false, foundSymptoms, []);
    } else {
      this.illnessService.searchIllnesses(term)
        .pipe(
          catchError(err => {
            this.setSearchResults.bind(this, isSymptom, true, foundSymptoms);

            return throwError(err);
          })
        )
        .subscribe(
          this.setSearchResults.bind(this, isSymptom, false, foundSymptoms)
        )
    }
  }

  private setSearchResults(isSymptom: boolean, errorThrown: boolean, foundSymptoms: Array<any>, foundIllnesses: Array<any>) {
    if (errorThrown) {
      foundIllnesses = [];
    }
    const illnesses: Array<any> = [];
    this.addIllnesses(foundIllnesses, illnesses);
    const nextValues = _.concat(illnesses, foundSymptoms);
    if (!isSymptom && !nextValues.length) {
      // no symptom found in live search
      // could be an illness
      this.searchTryIllness = true;
      this.searchResults.next([]);
    } else {
      // show symptom results
      this.noRecordFound = false;
      this.hasBackendError = false;
      this.searchTryIllness = false;
      this.searchResults.next(nextValues);
    }
  }

  private addIllnesses(illnesses: Array<any>, existingIllnesses: Array<any>) {
    for (let i = 0; i < illnesses.length; i++) {
      const illness = illnesses[i];
      existingIllnesses.push({
          name: illness.description,
          value: illness.name
        }
      );
      const childNodes = illness.childNodes;
      if (childNodes) {
        this.addIllnesses(childNodes, existingIllnesses);
      }
    }
  }
}
