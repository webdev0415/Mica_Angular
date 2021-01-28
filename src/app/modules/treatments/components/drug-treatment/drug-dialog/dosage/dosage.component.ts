import { Component, OnInit, ChangeDetectionStrategy, Input, SimpleChanges, OnChanges, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'mica-dosage',
  templateUrl: './dosage.component.html',
  styleUrls: ['./dosage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DosageComponent implements OnInit, OnChanges, OnDestroy {
  @Input() policiesCtrlArray: FormArray;
  @Input() dosageInfo: Treatments.Drug.Category;
  @Input() drugName: string;
  @Input() dosageRecommendationCtrl: FormControl;

  isRoutePreset = false;
  isFormPreset = false;
  isStrengthPreset = false;

  selectedDosageTarget: '' | 'drug' | 'policy';
  selectedTargetPolicyCtrl: FormControl | null;

  strengthCtrl: FormControl = new FormControl(0);
  formCtrl: FormControl = new FormControl('');
  routeCtrl: FormControl = new FormControl('');
  measurementCtrl: FormControl = new FormControl('');
  amountCtrl: FormControl = new FormControl(0, );
  frequencyCtrl: FormControl = new FormControl('');
  prnCtrl: FormControl = new FormControl(false);
  dawCtrl: FormControl = new FormControl(false);
  quantityCtrl: FormControl = new FormControl('');
  dispenseFormCtrl: FormControl = new FormControl('');
  directionsCtrl: FormControl = new FormControl('');
  unitCtrl: FormControl = new FormControl('');

  dosageForm: FormGroup = new FormGroup({
    strength: this.strengthCtrl,
    form: this.formCtrl,
    route: this.routeCtrl,
    measurement: this.measurementCtrl,
    amount: this.amountCtrl,
    frequency: this.frequencyCtrl,
    prn: this.prnCtrl,
    daw: this.dawCtrl,
    quantity: this.quantityCtrl,
    dispenseForm: this.dispenseFormCtrl,
    directions: this.directionsCtrl,
    unit: this.unitCtrl
  });

  definedAmounts: string[] = ['1', '1-2', '1-3', '2-3', '0.33/third', '0.5/half', '0.5-1', '1.5', '2', '2.5', '3', '4', '5', '6', '7', '8', '9', '10'];
  definedForms: string[] = ['application', 'capsule', 'drop', 'gm', 'item', 'lozenge', 'mcg', 'mg', 'mL', 'package', 'patch', 'pill', 'puff', 'scoop', 'squirt', 'suppository', 'syringe', 'tablet', 'troche', 'unit'];
  definedRoutes: string[] = ['by mouth', 'ears, both', 'ear, left', 'ear, right', 'eyes, both', 'eye, left', 'eye, right', 'eyelids, apply to', 'eye, surgical', 'face, apply to', 'face, thin layer to', 'feeding tube, via', 'inhale', 'inject, intramuscular', 'intravenous', 'lip, under the', 'nail, apply to', 'nostrils, in the', 'penis, inject into', 'rectum, in the', 'scalp, apply to', 'skin, inject below', 'skin, inject into', 'skin, apply on', 'teeth, apply to', 'tongue, on the', 'tongue, under the', 'urethra, in the', 'vagina, in the', 'epidural', 'in vitro', 'intraarterial', 'intraarticular', 'intraocular', 'intraperitoneal', 'intrapleural', 'intrathecal', 'intrauterine', 'intravesical', 'perfusion', 'rinse'];
  definedFrequency: string[] = ['As Directed', 'DAILY', 'BID', 'TID', 'QID', 'Q1h WA', 'Q2h WA', 'Q2h', 'Q3h', 'Q4h', 'Q4-6h', 'Q6h', 'Q6-8h', 'Q8h', 'Q8-12h', 'Q12h', 'Q48h', 'Q72h', 'NIGHTLY', 'QHS', 'in A.M.', 'EVERY OTHER DAY', '2 TIMES WEEKLY', '3 TIMES WEEKLY', 'Q1WK', 'Q2wks', 'Q3wks', 'Once a month'];
  definedDispenseForm: string[] = ['Not Specified', 'Ampoule', 'Bag', 'Bottle', 'Box', 'Capsule', 'Cartridge', 'Container', 'Drop', 'Each', 'Fluid Ounce', 'Gram', 'Gum', 'Inhaler', 'International Unit', 'Kit', 'Liter', 'Lozenge', 'Milligram', 'Million Units', 'Mutually Defined', 'Pack', 'Packet', 'Pen', 'Pint', 'Strip', 'Suppository', 'Syringe', 'Tablespoon', 'Transdermal Patch', 'Tube', 'Unit', 'Vial'];
  definedUnits: string[] = ['Pills', 'G', 'MG', 'ML', 'MCG', 'MG/ML'];

  private destroy$: Subject<void> = new Subject();

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.policiesCtrlArray && this.policiesCtrlArray.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(
      () => this.cd.detectChanges()
    );

    this.quantityCtrl && this.quantityCtrl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(
      val => val && this.quantityCtrl.setValue(+val, { emitEvent: false })
    );

    this.strengthCtrl && this.strengthCtrl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(
      val => val && this.strengthCtrl.setValue(+val, { emitEvent: false })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    const dosageInfoChanges = changes.dosageInfo;

    if (dosageInfoChanges) {
      this.fillDefaultValues();
    }
  }

  onSetDosageClick(policyIdx?: number) {
    if (policyIdx || policyIdx === 0) {
      this.selectedTargetPolicyCtrl = <FormControl>this.policiesCtrlArray.at(policyIdx);
      this.selectedDosageTarget = 'policy';

      const alternative = this.selectedTargetPolicyCtrl.value.alternative;

      alternative && alternative.dosageRecommendation && this.fillDosageFormWithData(alternative.dosageRecommendation);
    } else {
      const dosage = this.dosageRecommendationCtrl.value;

      this.selectedDosageTarget = 'drug';
      this.selectedTargetPolicyCtrl = null;

      dosage && this.fillDosageFormWithData(dosage);
    }
  }

  resetDosageForm() {
    this.dosageForm.setValue(
      {
        strength: 0,
        form: '',
        route: '',
        measurement: '',
        amount: 0,
        frequency: '',
        prn: false,
        daw: false,
        quantity: 0,
        dispenseForm: '',
        directions: '',
        unit: ''
      }
    );
  }

  onSaveDosageClick() {
    const dosage = this.dosageForm.value;

    if (this.selectedTargetPolicyCtrl) {
      const policy: Treatments.Drug.Policy = this.selectedTargetPolicyCtrl.value;
      const alternative: Treatments.Drug.DrugAlternative = {
        drugName: this.drugName,
        dosageRecommendation: dosage,
      };

      if (this.dosageInfo) {
        const { rxcui, description } = this.dosageInfo;

        alternative.rxcui = rxcui;
        alternative.rxcuiDesc = description;
      }

      this.selectedTargetPolicyCtrl.setValue({ ...policy, alternative })
    } else {
      this.dosageRecommendationCtrl.setValue(dosage);
    }

    this.onBackClick();
  }

  onBackClick() {
    this.selectedDosageTarget = '';
    this.selectedTargetPolicyCtrl = null;

    this.resetDosageForm();
    this.fillDefaultValues();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fillDosageFormWithData(dosage: Treatments.Drug.Dosage) {
    this.dosageForm.setValue(dosage);
  }

  private fillDefaultValues() {
    if (this.dosageInfo) {
      const { strength, dosageForm, route } = this.dosageInfo;

      if (strength) {
        this.strengthCtrl.setValue(strength);
        this.isStrengthPreset = true;
      } else {
        this.strengthCtrl.reset();
        this.isStrengthPreset = false;
      }

      if (dosageForm && dosageForm[0]) {
        this.formCtrl.setValue(dosageForm[0]);
        this.isFormPreset = true;
      } else {
        this.formCtrl.reset();
        this.isFormPreset = false;
      }

      if (route && route[0]) {
        this.routeCtrl.setValue(route[0]);
        this.isRoutePreset = true;
      } else {
        this.routeCtrl.reset();
        this.isRoutePreset = false;
      }
    } else {
      this.strengthCtrl.reset();
      this.formCtrl.reset();
      this.routeCtrl.reset();

      this.isFormPreset = false;
      this.isRoutePreset = false;
    }
  }
}
