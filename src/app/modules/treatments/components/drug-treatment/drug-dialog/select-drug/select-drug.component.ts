import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { ErrorStateMatcher } from '@angular/material';
import { Observable, Subject } from 'rxjs';
import { debounceTime, filter, map, takeUntil } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { selectStepperDrugsSearching, selectStepperDrugsSearchResults, selectStepperSelectedDrugInfo } from '../../../../state/treatments.selectors';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { loadDrugInfo, searchDrugsByName } from '../../../../state/treatments.actions';

@Component({
  selector: 'mica-select-drug',
  templateUrl: './select-drug.component.html',
  styleUrls: ['./select-drug.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectDrugComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() isPrescription: boolean;
  @Output() nextStep: EventEmitter<void> = new EventEmitter();
  @Output() selectDosage: EventEmitter<Treatments.Drug.Category> = new EventEmitter();
  @ViewChild('initialField', { static: false }) initialField: ElementRef;

  drugSearchCtrl: FormControl = new FormControl('', [Validators.required, Validators.minLength(3)]);
  cardinalityCtrl: FormControl = new FormControl('SINGLE');
  ndcCtrl: FormControl = new FormControl(true);
  drugSourceCtrl: FormControl = new FormControl('RXNORM');

  drugs$: Observable<Treatments.Drug.Short[]> = this.store.pipe(select(selectStepperDrugsSearchResults));
  drugsSearching$: Observable<boolean> = this.store.pipe(select(selectStepperDrugsSearching));
  selectedDrugInfo$: Observable<Treatments.Drug.GenericSearchModel | null> = this.store.pipe(select(selectStepperSelectedDrugInfo));

  searchErrorStateMatcher: ErrorStateMatcher = { isErrorState: () => false };
  firstSearchTriggered = false;
  showSearchFlag = true;
  showAdvancedFlag = false;
  showDosagesFlag = false;
  noResultsFound$: Observable<boolean> = Observable.combineLatest(this.drugs$, this.drugsSearching$).pipe(
    map(([drugs, searching]) => !drugs.length && !searching)
  );

  private destroy$: Subject<void> = new Subject();

  constructor(private fb: FormBuilder,
              private store: Store<State.Root>) { }

  ngOnInit() {
    this.drugSourceCtrl.valueChanges.pipe(
      takeUntil(this.destroy$),
      filter(() => this.drugSearchCtrl.valid)
    ).subscribe(() => this.searchDrugs());

    this.drugSearchCtrl.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(500),
      filter(val => val && this.drugSearchCtrl.valid)
    ).subscribe(() => this.searchDrugs());
  }

  ngAfterViewInit() {
    setTimeout(
      () => this.initialField && this.initialField.nativeElement.focus(),
      500
    );
  }

  onDrugSearch() {
    this.searchDrugs();
  }

  onDosageClick(productId: string) {
    this.loadDrugInfo(productId);
    this.showDosages();
    this.hideSearch();
  }

  onDrugSelectClick(productId: string) {
    this.loadDrugInfo(productId);
    this.nextStep.next();
  }

  onBackClick() {
    this.hideDosages();
    this.showSearch();
  }

  onDosageSelectClick(dosage: Treatments.Drug.Category) {
    this.selectDosage.next(dosage);
    this.nextStep.next();
  }

  advancedSearchToggle() {
    this.showAdvancedFlag = !this.showAdvancedFlag;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private showSearch() {
    this.showSearchFlag = true;
    this.initialField && this.initialField.nativeElement.focus();
  }

  private hideSearch() {
    this.showSearchFlag = false;
  }

  private showDosages() {
    this.showDosagesFlag = true;
  }

  private hideDosages() {
    this.showDosagesFlag = false;
  }

  private loadDrugInfo(productId: string) {
    const cardinality = this.cardinalityCtrl.value;
    const ndc = this.ndcCtrl.value;

    this.store.dispatch(loadDrugInfo({ productId, drugType: this.drugType, cardinality, ndc }));
  }

  private searchDrugs() {
    const term = this.drugSearchCtrl.value;
    const source = this.drugSourceCtrl.value;

    this.store.dispatch(searchDrugsByName({ term, drugType: this.drugType, source }));
    this.firstSearchTriggered = true;
  }

  private get drugType(): Treatments.Drug.DrugType {
    return this.isPrescription ? 'PRESCRIPTION' : 'OTC';
  }
}
