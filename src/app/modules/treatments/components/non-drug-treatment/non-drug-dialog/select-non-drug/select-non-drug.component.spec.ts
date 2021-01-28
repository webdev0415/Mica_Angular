import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectNonDrugComponent } from './select-non-drug.component';
import {
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
} from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';
import { treatmentsInit } from '../../../../../../app.config';
import { SortByPipe } from '../../../../../pipes/sort-by.pipe';

describe('SelectNonDrugComponent', () => {
  let component: SelectNonDrugComponent;
  let fixture: ComponentFixture<SelectNonDrugComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SelectNonDrugComponent,
        SortByPipe
      ],
      providers: [
        provideMockStore({ initialState: { treatments: treatmentsInit } }),
      ],
      imports: [
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectNonDrugComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
