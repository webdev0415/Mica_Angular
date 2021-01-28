import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnDestroy,
  Output,
  EventEmitter, ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';

import Description = Treatments.NonDrug.Description;
import TreatmentTypeDescTemplate = Treatments.Types.TreatmentTypeDescTemplate;
import { Subject } from 'rxjs';
import SourceInfoType = SourceInfo.SourceInfoType;
import * as _ from 'lodash';
import { MatHorizontalStepper } from '@angular/material';

@Component({
  selector: 'mica-add-treatment-dialog',
  templateUrl: './non-drug-dialog.component.html',
  styleUrls: ['./non-drug-dialog.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NonDrugDialogComponent implements OnDestroy {
  @Input() nonDrugToEdit: Description;
  @Input() atcGroup: Treatments.AtcGroup;
  @Input() nonDrugTypeDescList: Treatments.Types.TreatmentTypeDescTemplate[];

  @Output() saveNonDrug: EventEmitter<{ atcGroup: Treatments.AtcGroup, nonDrug: Treatments.NonDrug.Description }> = new EventEmitter();
  @Output() exitModal: EventEmitter<boolean> = new EventEmitter();

  @ViewChild('stepper', { read: MatHorizontalStepper, static: true }) stepper: MatHorizontalStepper;

  sourceCtrlArray: FormArray = this.fb.array([], Validators.minLength(1));
  nonDrugTypeDescCtrl: FormControl = new FormControl(null);

  private destroy$ = new Subject();

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.fillForm();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.saveNonDrug.complete();
  }

  displayFn(value: TreatmentTypeDescTemplate): string {
    return value.shortName;
  }

  onSaveNonDrugClick() {
    const defaultAtcGroup = {
      atcGroupName: 'Unspecified',
      groupCode: 'unspecified',
      micaGroupName: 'Unspecified'
    };
    const atcGroup = this.atcGroup || defaultAtcGroup;
    const nonDrug = {
      ...this.nonDrugTypeDescCtrl.value,
      sourceInfo: this.sourceCtrlArray.value,
    };

    this.saveNonDrug.next({ atcGroup, nonDrug });
    this.saveNonDrug.complete();
  }

  closeModal() {
    this.exitModal.next(true);
  }

  stepperControl(stepperIndex: number) {
    this.stepper.selectedIndex = stepperIndex;
  }

  private fillForm() {
    if (this.nonDrugToEdit && this.nonDrugTypeDescCtrl) {
      const nonDrugTypeDesc: Treatments.Types.TreatmentTypeDescTemplate = _.omit(this.nonDrugToEdit, ['sourceInfo']);
      const sourceInfo = this.nonDrugToEdit.sourceInfo;

      if (sourceInfo) {
        sourceInfo.forEach((source: SourceInfoType) => {
          this.sourceCtrlArray.push(new FormControl(source));
        });
      }

      this.nonDrugTypeDescCtrl.setValue(nonDrugTypeDesc);
    }
  }

}
