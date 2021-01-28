import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ByDrugComponent } from './by-drug.component';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import * as _ from 'lodash';
import { defaultState } from '../../../../app.config';
import { PipesModule } from '../../../pipes/pipes.module';

const state = _.cloneDeep(defaultState);

@Component({
  selector: 'mica-drug-search',
  template: '<div></div>'
})
class MockDrugSearchComponent {
  @Input() drugType: Treatments.Drug.DrugType;
  @Input() drugInfo: Treatments.Drug.GenericSearchModel;
  @Input() drugList: Treatments.Drug.Short[];
  @Input() useAutocomplete = false;

  @Output() searchDrugs: EventEmitter<any> = new EventEmitter();
  @Output() selectDrug: EventEmitter<any> = new EventEmitter();
}

@Component({
  selector: 'mica-drug-restrictions-form',
  template: '<div></div>'
})
class MockDrugRestrictionFormComponent {
  @Input() drugInfo: Treatments.Drug.GenericSearchModel;
}

describe('ByDrugComponent', () => {
  let component: ByDrugComponent;
  let fixture: ComponentFixture<ByDrugComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ByDrugComponent,
        MockDrugRestrictionFormComponent,
        MockDrugSearchComponent
      ],
      providers: [
        provideMockStore({ initialState: state }),
      ],
      imports: [ PipesModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ByDrugComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
