import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrugDialogComponent } from './drug-dialog.component';
import {
  MatButtonToggleModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatInputModule,
  MatListModule,
  MatRadioModule,
  MatStepperModule,
  MatIconModule, MatSelectModule,
} from '@angular/material';
import { FormArray, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideMockStore } from '@ngrx/store/testing';
import { defaultState } from '../../../../../app.config';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'mica-select-drug',
  template: '<div></div>'
 })
class MockSelectDrugComponent {
  @Input() isPrescription: boolean;
  @Output() selectDrug: EventEmitter<void> = new EventEmitter();
}

@Component({
  selector: 'mica-add-drug-sources',
  template: '<div></div>'
 })
class MockAddSourcesComponent {
  @Input() sourceCtrlArray: FormArray;
  @Input() drugName: string;
}

@Component({
  selector: 'mica-add-policies',
  template: '<div></div>'
 })
class MockAddPoliciesComponent {
  @Input() policiesCtrlArray: FormArray;
  @Input() drugName: string;
  @Input() editMode: boolean
}

@Component({
  selector: 'mica-dosage',
  template: '<div></div>'
 })
class MockPrescriptionComponent {
  @Input() policiesCtrlArray: FormArray;
  @Input() dosageInfo: Treatments.Drug.Category;
  @Input() drugName: string;
  @Input() dosageRecommendationCtrl: FormControl;
}

@Component({
  selector: 'mica-drug-review',
  template: '<div></div>'
})
class MockDrugReviewComponent {
  @Input() drugName: string;
  @Input() sourceCtrlArray: FormArray;
  @Input() policyCtrlArray: FormArray;
  @Input() dosageRecommendationCtrl: FormControl;
  @Output() stepperControl: EventEmitter<number> = new EventEmitter<number>();
}

describe('DrugDialogComponent', () => {
  let component: DrugDialogComponent;
  let fixture: ComponentFixture<DrugDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DrugDialogComponent,
        MockSelectDrugComponent,
        MockAddSourcesComponent,
        MockAddPoliciesComponent,
        MockPrescriptionComponent,
        MockDrugReviewComponent
      ],
      providers: [
        provideMockStore({ initialState: defaultState }),
      ],
      imports: [
        MatStepperModule,
        MatListModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonToggleModule,
        MatRadioModule,
        MatCheckboxModule,
        BrowserAnimationsModule,
        MatIconModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrugDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onDosageSelected', () => {
    const dosage: Treatments.Drug.Category = {
      rxcui: 12,
      route: 'test',
      rxcui_ai_type: 'test',
      rxcui_ai_value: 'test',
      rxcui_am_type: 'test',
      rxcui_am_value: 'test',
      dosageForm: ['FORM'],
      description: 'test',
      drugType: 'type',
      cardinality: 'test',
      brandingType: 'test',
      deaSchedule: 'scedule',
      productInfo: [],
      strength: 1,
      status: 'test'
    };

    component.onDosageSelected(dosage);
    expect(component.selectedDosage).toEqual(dosage);
    expect(component.rxcuiCtrl.value).toEqual(dosage.rxcui);
    expect(component.rxcuiDescCtrl.value).toEqual(dosage.description);
  });
});
