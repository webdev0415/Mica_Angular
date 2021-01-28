import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  Input,
  ViewChild,
  Output,
  EventEmitter,
  OnInit
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { resetStepper } from '../../../state/treatments.actions';
import { selectStepperSelectedDrugInfo } from '../../../state/treatments.selectors';
import { MatHorizontalStepper } from '@angular/material';
import { map, take, takeUntil } from 'rxjs/operators';
import Description = Treatments.Drug.Description;
import Policy = Treatments.Drug.Policy;
import SourceInfoType = SourceInfo.SourceInfoType;

@Component({
  selector: 'mica-add-drug-dialog',
  templateUrl: './drug-dialog.component.html',
  styleUrls: ['./drug-dialog.component.sass'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class DrugDialogComponent implements OnInit, OnDestroy {
  @Input() isPrescription: boolean;
  @Input() drugToEdit: Description;
  @Input() atcGroup: Treatments.AtcGroup;
  @Output() saveDrug: EventEmitter<{ atcGroup: Treatments.AtcGroup, drug: Treatments.Drug.Description }> = new EventEmitter();
  @Output() exitModal: EventEmitter<boolean> = new EventEmitter();

  @ViewChild('stepper', { read: MatHorizontalStepper, static: true }) stepper: MatHorizontalStepper;

  selectedDrugInfo$: Observable<Treatments.Drug.GenericSearchModel | null> = this.store.pipe(select(selectStepperSelectedDrugInfo));
  selectedDosage: Treatments.Drug.Category;

  selectedDrugInfoGroups$: Observable<Treatments.AtcGroup[]> = this.selectedDrugInfo$.pipe(
    map(drugInfo => drugInfo ? drugInfo.header.atcgroups : [])
  );

  drugForm: FormGroup = new FormGroup({
    sourceInfo: this.fb.array([], Validators.minLength(1)),
    policies: this.fb.array([]),
    rxcui: new FormControl(NaN, Validators.required),
    rxcuiDesc: new FormControl('', Validators.required),
    drugName: new FormControl(''),
    dosageRecommendation: new FormControl(null, Validators.required),
  });
  sourceCtrlArray: FormArray = <FormArray>this.drugForm.get('sourceInfo');
  policiesCtrlArray: FormArray = <FormArray>this.drugForm.get('policies');
  rxcuiCtrl: FormControl = <FormControl>this.drugForm.get('rxcui');
  rxcuiDescCtrl: FormControl = <FormControl>this.drugForm.get('rxcuiDesc');
  drugNameCtrl: FormControl = <FormControl>this.drugForm.get('drugName');
  dosageRecommendationCtrl: FormControl = <FormControl>this.drugForm.get('dosageRecommendation');
  atcGroupCtrl: FormControl = new FormControl(null, Validators.required);

  private destroy$: Subject<void> = new Subject();

  constructor(private fb: FormBuilder,
              private store: Store<State.Root>) { }


  get displayDrugName(): string {
    return this.rxcuiDescCtrl.value || this.drugNameCtrl.value;
  }

  ngOnInit() {
    this.selectedDrugInfo$.pipe(takeUntil(this.destroy$)).subscribe(
      drug => {
        this.drugNameCtrl.setValue(drug ? drug.header.drugName : '');

        if (drug) {
          const defaultAtcGroup = {
            atcGroupName: 'Unspecified',
            groupCode: 'unspecified',
            micaGroupName: 'Unspecified'
          };
          this.atcGroupCtrl.setValue(drug.header.atcgroups.length > 1 ? null : (drug.header.atcgroups[0] || defaultAtcGroup));
        } else {
          this.atcGroupCtrl.setValue(null);
        }

      }
    );
    this.fillForm();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(resetStepper());
  }

  onNextStepClick() {
    this.stepperControl(1);
  }

  onDosageSelected(dosage: Treatments.Drug.Category) {
    this.selectedDosage = dosage;
    this.rxcuiCtrl.setValue(dosage.rxcui);
    this.rxcuiDescCtrl.setValue(dosage.description);
  }

  stepperControl(stepperIndex: number) {
    this.stepper.selectedIndex = stepperIndex;
  }

  onSaveDrugClick() {
    const atcGroup = this.atcGroup || this.atcGroupCtrl.value;
    const drug = this.drugForm.value;

    this.saveDrug.next({ atcGroup, drug });
  }

  closeModal() {
    this.exitModal.next(true);
  }

  private fillForm() {
    if (this.drugToEdit && this.drugForm) {
      if ('sourceInfo' in this.drugToEdit) {
        this.drugToEdit.sourceInfo.forEach((source: SourceInfoType) => {
          console.log('THIS IS THE SOURCE FROM THE FOR EACH LOOP IN THE ADD DRUG DIALOG ====>', source);
          this.sourceCtrlArray.push(new FormControl(source))
        })
      }

      if (this.drugToEdit && this.drugToEdit.policies) {
        this.drugToEdit.policies.forEach((policy: Policy) => {
          this.policiesCtrlArray.push(new FormControl(policy));
        });
      }

      if ('drugName' in this.drugToEdit) {
        this.drugNameCtrl.setValue(this.drugToEdit.drugName);
      }

      if ('rxcui' in this.drugToEdit) {
        this.rxcuiCtrl.setValue(this.drugToEdit.rxcui);
      }

      if ('rxcuiDesc' in this.drugToEdit) {
        this.rxcuiDescCtrl.setValue(this.drugToEdit.rxcuiDesc);
      }

      if ('dosageRecommendation' in this.drugToEdit) {
        this.dosageRecommendationCtrl.setValue(this.drugToEdit.dosageRecommendation);
      }
    }
  }
}
