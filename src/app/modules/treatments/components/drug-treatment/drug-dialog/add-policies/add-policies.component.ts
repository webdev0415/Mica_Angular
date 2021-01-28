import { Component, OnInit, ChangeDetectionStrategy, Input, OnDestroy } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { NgRedux } from '@angular-redux/store';
import { Observable, Subject } from 'rxjs';
import { allDataStoreRefTypes } from '../../../../../../state/symptoms/symptoms.selectors';
import {
  selectStepperIllnessSearchResults,
  selectStepperIllnessSearchResultsTwo
} from '../../../../state/treatments.selectors';
import { select, Store } from '@ngrx/store';
import {
  debounceTime,
  filter,
  map,
  startWith,
  switchMap,
  takeUntil,
  withLatestFrom
} from 'rxjs/operators';
import DataStoreRefTypeValue = Workbench.DataStoreRefTypeValue;
import DataStoreRefType = Workbench.DataStoreRefType;
import { searchStepperIllnesses, searchStepperIllnessesTwo } from '../../../../state/treatments.actions';

type Target = 'ILLNESS' | 'SYMPTOM' | 'PROPERTY';
type TargetOperator = 'AND' | 'OR' | 'NONE';
type TargetCompare = 'NONE' | 'EQUALS' | 'LESSTHAN' | 'LTEEQUAL' | 'GTEEQUAL' | 'GREATERTHAN';
type ActionType = 'INCLUDE' | 'EXCLUDE' | 'NONE';
type PropertyType = 'Age' | 'Weight';

@Component({
  selector: 'mica-add-policies',
  templateUrl: './add-policies.component.html',
  styleUrls: ['./add-policies.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddPoliciesComponent implements OnInit, OnDestroy {
  @Input() policiesCtrlArray: FormArray;
  @Input() drugName: string;
  @Input() editMode: boolean;

  actions: { key: string, value: ActionType }[] = [
    { key: 'Include', value: 'INCLUDE' },
    { key: 'Exclude', value: 'EXCLUDE' },
  ];
  targetOptions: { key: string, value: Target }[] = [
    { key: 'Illness', value: 'ILLNESS' },
    { key: 'Symptom', value: 'SYMPTOM' },
    { key: 'Property', value: 'PROPERTY' },
  ];
  targetComparisons: { key: string, value: TargetCompare }[] = [
    { key: 'None', value: 'NONE' },
    { key: 'Equals', value: 'EQUALS' },
    { key: 'Less than', value: 'LESSTHAN' },
    { key: 'Less than or Equal to', value: 'LTEEQUAL' },
    { key: 'Greater than or Equal to', value: 'GTEEQUAL' },
    { key: 'Greater than', value: 'GREATERTHAN' },
  ];

  targetOperators: { key: string, value: TargetOperator }[] = [
    { key: 'None', value: 'NONE'},
    { key: 'And', value: 'AND'},
    { key: 'Or', value: 'OR'},
  ];
  properties: PropertyType[] = ['Age', 'Weight'];

  // form fields
  targetCtrl: FormControl = new FormControl('', []);
  propertyNameCtrl: FormControl = new FormControl('', []);
  propertyNameTwoCtrl: FormControl = new FormControl('', []);
  targetDetailCtrl: FormControl = new FormControl('', []);
  targetDetailTwoCtrl: FormControl = new FormControl('', []);

  action: ActionType | '';
  targetCompare: TargetCompare = 'NONE';
  targetOperator: TargetOperator = 'NONE';
  // -------------

  policyTargetErrorStateMatcher: ErrorStateMatcher = { isErrorState: () => false };
  policyDetailErrorStateMatcher: ErrorStateMatcher = { isErrorState: () => false };

  filteredSymptoms$: Observable<string[]>;
  filteredDetails$: Observable<DataStoreRefTypeValue[]>;
  filteredDetailsTwo$: Observable<DataStoreRefTypeValue[]>;
  filteredIllnesses$: Observable<Illness.SearchValue[]> = this.store.pipe(select(selectStepperIllnessSearchResults));
  filteredIllnessesTwo$: Observable<Illness.SearchValue[]> = this.store.pipe(select(selectStepperIllnessSearchResultsTwo));

  private selectedSymptom$: Observable<DataStoreRefType>;
  private dataStoreRefTypes$: Observable<Workbench.DataStoreRefTypesDictionary> = this.s.select(allDataStoreRefTypes);
  private destroy$: Subject<void> = new Subject();

  constructor(private s: NgRedux<State.Root>,
              private store: Store<State.Root>) { }

  get target(): Target {
    return this.targetCtrl.value;
  }

  get formValid(): boolean {
    return !!(this.target && this.action && this.propertyNameCtrl.value);
  }

  ngOnInit() {
    this.filteredSymptoms$ = this.propertyNameCtrl.valueChanges.pipe(
      filter(() => this.target === 'SYMPTOM'),
      startWith(''),
      switchMap(value => {
        const filterValue = value.toLowerCase();

        return this.dataStoreRefTypes$.pipe(
          map(val => Object.keys(val).filter(key => key.toLowerCase().includes(filterValue)))
        );
      })
    );

    this.selectedSymptom$ = this.propertyNameCtrl.valueChanges.pipe(
      filter(() => this.target === 'SYMPTOM'),
      switchMap(symptomName => {
        return this.dataStoreRefTypes$.pipe(
          map(dictionary => dictionary[symptomName])
        )
      })
    );

    // symptom details autocompletes >>>
    this.filteredDetails$ = this.targetDetailCtrl.valueChanges.pipe(
      startWith(''),
      filter(() => this.target === 'SYMPTOM'),
      withLatestFrom(this.selectedSymptom$),
      map(([value, symptom]) => {
        const term = value.name || value;
        const filterValue = term.toLowerCase();

        return symptom && symptom.values && symptom.values.filter(({ name }) => {
          return name.toLowerCase().includes(filterValue) && name !== this.targetDetailTwoCtrl.value.name;
        }) || [];
      })
    );

    this.filteredDetailsTwo$ = this.targetDetailTwoCtrl.valueChanges.pipe(
      startWith(''),
      filter(() => this.target === 'SYMPTOM'),
      withLatestFrom(this.selectedSymptom$),
      map(([value, symptom]) => {
        const term = value.name || value;
        const filterValue = term.toLowerCase();

        return symptom && symptom.values && symptom.values.filter(({ name }) => {
          return name.toLowerCase().includes(filterValue) && name !== this.targetDetailCtrl.value.name;
        }) || [];
      })
    );
    // <<< symptom details autocompletes

    // illness autocomplete >>>
    this.propertyNameCtrl.valueChanges.pipe(
      takeUntil(this.destroy$),
      filter(() => this.target === 'ILLNESS'),
      filter(val => val.length >= 3),
      debounceTime(500),
    ).subscribe(term => this.store.dispatch(searchStepperIllnesses({ term })));
    // <<< illness autocomplete

    // illness autocomplete >>>
    this.propertyNameTwoCtrl.valueChanges.pipe(
      takeUntil(this.destroy$),
      filter(() => this.target === 'ILLNESS'),
      filter(val => val.length >= 3),
      debounceTime(500),
    ).subscribe(term => this.store.dispatch(searchStepperIllnessesTwo({ term })));
    // <<< illness autocomplete

    // resets
    this.targetCtrl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.resetPropertyNames();
      this.resetDetails();
      this.resetOperators();
    });

    this.propertyNameCtrl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.resetDetails();
      this.resetOperators();
    });
  }

  addPolicy() {
    const details: string[] = [];
    const properties: string[] = [];
    const propertyOne = this.propertyNameCtrl.value;
    const propertyTwo = this.propertyNameTwoCtrl.value;
    const detailOne = this.targetDetailCtrl.value;
    const detailTwo = this.targetDetailTwoCtrl.value;

    properties.push(propertyOne);

    switch (this.target) {
      case 'ILLNESS': {
        propertyTwo && properties.push(propertyTwo);

        break;
      }
      case 'SYMPTOM': {
        detailOne && details.push(detailOne.name);
        detailTwo && details.push(detailTwo.name);

        break;
      }
      case 'PROPERTY': {
        detailOne && details.push(detailOne);
        detailTwo && details.push(detailTwo);
      }
    }

    const formattedPolicy = {
      action: this.action,
      target: this.target,
      propertyName: properties,
      targetDetail: details,
      targetOperator: this.targetOperator,
      targetCompare: this.targetCompare
    };

    this.policiesCtrlArray.push(new FormControl(formattedPolicy));
    this.resetPolicyForm();
  }

  removePolicy(idx: number) {
    this.policiesCtrlArray.removeAt(idx);
  }

  detailPlaceholder(): string {
    switch (this.target) {
      case 'PROPERTY':
        return `Enter ${this.propertyNameCtrl.value}`;
      case 'SYMPTOM':
        return `Select detail from ${this.propertyNameCtrl.value}`;
      default:
        return '';
    }
  }

  formatPolicy(policy?: Treatments.Drug.Policy): string {
    const { drugName, propertyNameCtrl, propertyNameTwoCtrl, targetDetailCtrl, targetDetailTwoCtrl } = this;
    let action;
    let target;
    let targetCompare;
    let targetOperator;
    let propertyName;
    let propertyNameTwo;
    let targetDetail;
    let targetDetailTwo;

    if (policy) {
      action = policy.action;
      target = policy.target;
      targetCompare = policy.targetCompare;
      targetOperator = policy.targetOperator || '';
      propertyName = policy.propertyName[0];
      propertyNameTwo = policy.propertyName[1] || '';
      targetDetail = policy.targetDetail[0];
      targetDetailTwo = policy.targetDetail[1] || '';
    } else {
      action = this.action;
      target = this.target;
      targetCompare = this.targetCompare || '';
      targetOperator = this.targetOperator || '';
      propertyName = propertyNameCtrl.value || '';
      propertyNameTwo = propertyNameTwoCtrl.value || '';
      targetDetail = ((typeof targetDetailCtrl.value === 'string') ? targetDetailCtrl.value : targetDetailCtrl.value.name) || '';
      targetDetailTwo = ((typeof targetDetailTwoCtrl.value === 'string') ? targetDetailTwoCtrl.value : targetDetailTwoCtrl.value.name) || '';
    }

    const base = `${action} ${drugName || '[DRUG IS NOT SELECTED]'} when ${target}`;

    if (target === 'ILLNESS') {
      return `${base} equals ${propertyName} ${targetOperator} ${propertyNameTwo}`;
    } else if (target) {
      return `${base} ${propertyName} ${targetCompare} ${targetDetail} ${targetOperator} ${targetDetailTwo}`;
    } else {
      return '';
    }
  }

  displaySymptomDetailFn(detail: DataStoreRefTypeValue) {
    return detail.name;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetPropertyNames() {
    this.propertyNameCtrl.setValue('');
    this.propertyNameTwoCtrl.setValue('');
  }

  private resetDetails() {
    this.targetDetailCtrl.setValue('');
    this.targetDetailTwoCtrl.setValue('');
  }

  private resetOperators() {
    this.targetOperator = 'NONE';
    this.targetCompare = 'NONE';
  }

  private resetPolicyForm() {
    this.action = '';
    this.targetCtrl.setValue('');
  }
}
