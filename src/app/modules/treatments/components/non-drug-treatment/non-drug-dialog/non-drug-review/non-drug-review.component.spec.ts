import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NonDrugReviewComponent } from './non-drug-review.component';
import { provideMockStore } from '@ngrx/store/testing';
import * as _ from 'lodash';
import { defaultState } from '../../../../../../app.config';
import { MatCardModule } from '@angular/material';
import { MockSourceFormComponent } from '../../../../../../../test/components-stubs';

const state = _.cloneDeep(defaultState);

describe('NonDrugReviewComponent', () => {
  let component: NonDrugReviewComponent;
  let fixture: ComponentFixture<NonDrugReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        NonDrugReviewComponent,
        MockSourceFormComponent
      ],
      providers: [
        provideMockStore({ initialState: state }),
      ],
      imports: [
        MatCardModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NonDrugReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
