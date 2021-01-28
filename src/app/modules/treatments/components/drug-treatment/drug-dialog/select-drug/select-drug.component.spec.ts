import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectDrugComponent } from './select-drug.component';
import {
  MatButtonToggleModule, MatCheckboxModule,
  MatFormFieldModule, MatIconModule,
  MatInputModule,
  MatListModule, MatRadioModule,
  MatStepperModule,
} from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';
import { treatmentsInit } from '../../../../../../app.config';

describe('SelectNonDrugComponent', () => {
  let component: SelectDrugComponent;
  let fixture: ComponentFixture<SelectDrugComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectDrugComponent ],
      providers: [
        provideMockStore({ initialState: { treatments: treatmentsInit } }),
      ],
      imports: [
        MatStepperModule,
        MatListModule,
        MatInputModule,
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonToggleModule,
        MatRadioModule,
        MatCheckboxModule,
        BrowserAnimationsModule,
        MatIconModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectDrugComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onDrugSearch', () => {
    const searchDrugsSpy = spyOn(<any>component, 'searchDrugs').and.callFake(() => {});

    component.onDrugSearch();
    expect(searchDrugsSpy).toHaveBeenCalled();
  });

  it('onDosageClick', () => {
    const loadDrugInfoSpy = spyOn(<any>component, 'loadDrugInfo').and.callFake(() => {});
    const showDosagesSpy = spyOn(<any>component, 'showDosages').and.callFake(() => {});
    const hideSearchSpy = spyOn(<any>component, 'hideSearch').and.callFake(() => {});

    component.onDosageClick('test');
    expect(loadDrugInfoSpy).toHaveBeenCalledWith('test');
    expect(showDosagesSpy).toHaveBeenCalled();
    expect(hideSearchSpy).toHaveBeenCalled();
  });

  it('onDrugSelectClick', () => {
    const loadDrugInfoSpy = spyOn(<any>component, 'loadDrugInfo').and.callFake(() => {});
    const nextStepSpy = spyOn(<any>component.nextStep, 'next').and.callFake(() => {});

    component.onDrugSelectClick('test');
    expect(loadDrugInfoSpy).toHaveBeenCalledWith('test');
    expect(nextStepSpy).toHaveBeenCalled();
  });
});
