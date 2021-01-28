import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'mica-drug-search',
  templateUrl: './drug-search.component.html',
  styleUrls: ['./drug-search.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DrugSearchComponent implements OnInit {
  @Input() drugType: Treatments.Drug.DrugType;
  @Input() drugInfo: Treatments.Drug.GenericSearchModel;
  @Input() drugList: Treatments.Drug.Short[];
  @Input() useAutocomplete = false;

  @Output() searchDrugs: EventEmitter<{
    term: string,
    drugType: Treatments.Drug.DrugType,
    source: Treatments.Drug.SearchSource,
  }> = new EventEmitter();
  @Output() selectDrug: EventEmitter<{
    productId: string,
    drugType: Treatments.Drug.DrugType,
    cardinality: Treatments.Drug.Cardinality,
    ndc: boolean,
  }> = new EventEmitter();

  drugSearchCtrl: FormControl = new FormControl('', [Validators.required, Validators.minLength(3)]);

  cardinalityCtrl: FormControl = new FormControl('SINGLE');
  ndcCtrl: FormControl = new FormControl(true);
  drugSourceCtrl: FormControl = new FormControl('RXNORM');
  drugTypeCtrl: FormControl = new FormControl('PRESCRIPTION');

  searchErrorStateMatcher: ErrorStateMatcher = { isErrorState: () => false };

  // flags
  showAdvancedFlag = false;

  private destroy$: Subject<void> = new Subject();

  constructor() { }

  ngOnInit() {
    this.drugSourceCtrl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.emitSearchDrugs());

    this.drugTypeCtrl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.emitSearchDrugs());

    this.drugSearchCtrl.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(500),
    ).subscribe(val => {
      if (typeof val === 'object') {
        this.emitSelectDrug(val.productIds[0]);
      } else {
        this.emitSearchDrugs();
      }
    });
  }

  ngOnChanges({ drugType }: SimpleChanges) {
    drugType && this.presetDrugType(drugType.currentValue);
  }

  onDrugSearch() {
    this.emitSearchDrugs();
  }

  advancedSearchToggle() {
    this.showAdvancedFlag = !this.showAdvancedFlag;
  }

  displayWithFn(drug: Treatments.Drug.Short): string {
    return drug.name;
  }

  private presetDrugType(drugType: Treatments.Drug.DrugType) {
    if (!drugType) {
      this.drugTypeCtrl.enable();
    } else {
      this.drugTypeCtrl.setValue(drugType);
      this.drugTypeCtrl.disable();
    }
  }

  private emitSearchDrugs() {
    const term = this.drugSearchCtrl.valid ? this.drugSearchCtrl.value : '';
    const source = this.drugSourceCtrl.value;
    const drugType = this.drugTypeCtrl.value;

    this.searchDrugs.next({ term, drugType, source });
  }

  private emitSelectDrug(productId: string) {
    const cardinality = this.cardinalityCtrl.value;
    const ndc = this.ndcCtrl.value;
    const drugType = this.drugTypeCtrl.value;

    this.selectDrug.next({ productId, drugType, cardinality, ndc });
  }
}
