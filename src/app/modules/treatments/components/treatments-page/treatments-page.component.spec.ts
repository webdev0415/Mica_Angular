import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentsPageComponent } from './treatments-page.component';
import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material';
import * as _ from 'lodash';
import { defaultState } from '../../../../app.config';
import { NgRedux } from '@angular-redux/store';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'mica-by-illness',
  template: '<div></div>'
})
class MockMicaByIllnessComponent {}

@Component({
  selector: 'mica-by-drug',
  template: '<div></div>'
})
class MockMicaByDrugComponent {}

describe('TreatmentsPageComponent', () => {
  const state = _.cloneDeep(defaultState);
  const mockRedux = {
    getState: () => state,
    dispatch: () => {
    }
  };
  let component: TreatmentsPageComponent;
  let fixture: ComponentFixture<TreatmentsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatTabsModule,
        BrowserAnimationsModule
      ],
      declarations: [
        TreatmentsPageComponent,
        MockMicaByIllnessComponent,
        MockMicaByDrugComponent
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreatmentsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
