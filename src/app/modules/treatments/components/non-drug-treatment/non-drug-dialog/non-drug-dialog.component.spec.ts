import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NonDrugDialogComponent } from './non-drug-dialog.component';
import {
  MatAutocompleteModule,
  MatFormFieldModule, MatIconModule,
  MatInputModule,
  MatOptionModule,
  MatStepperModule
} from '@angular/material';
import { FormArray, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../../../../shared/shared.module';
import { SourceService } from '../../../../../services';
import { SourceServiceStub } from '../../../../../../test/services-stubs/source.service.stub';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'mica-select-non-drug',
  template: '<div></div>'
})
class MockSelectNonDrugComponent {
  @Input() nonDrugTypeDescList: Treatments.Types.TreatmentTypeDescTemplate[];
  @Input() nonDrugTypeDescCtrl: FormControl;
  @Output() nextStep: EventEmitter<void> = new EventEmitter();
}

@Component({
  selector: 'mica-add-non-drug-sources',
  template: '<div></div>'
})
class MockAddNonDrugSourcesComponent {
  @Input() sourceCtrlArray: FormArray;
  @Input() nonDrugName: string;
}

@Component({
  selector: 'mica-non-drug-review',
  template: '<div></div>'
})
class MockNonDrugReviewComponent {
  @Input() nonDrugName: string;
  @Input() sourceCtrlArray: FormArray;
  @Output() stepperControl: EventEmitter<number> = new EventEmitter<number>();
}

describe('NonDrugDialogComponent', () => {
  let component: NonDrugDialogComponent;
  let fixture: ComponentFixture<NonDrugDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MockSelectNonDrugComponent,
        MockAddNonDrugSourcesComponent,
        NonDrugDialogComponent,
        MockNonDrugReviewComponent,
      ],
      providers: [
        { provide: SourceService, useClass: SourceServiceStub },
      ],
      imports: [
        MatStepperModule,
        MatFormFieldModule,
        MatAutocompleteModule,
        MatInputModule,
        MatOptionModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        SharedModule,
        MatStepperModule,
        MatIconModule
      ],

    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NonDrugDialogComponent);
    component = fixture.componentInstance;
    component.nonDrugTypeDescList = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('displayFn', () => {
    const desc = { shortName: 'test', typeDescID: 1 };

    expect(component.displayFn(<any>desc)).toEqual(desc.shortName);
  });
});
