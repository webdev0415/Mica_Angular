import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrugReviewComponent } from './drug-review.component';
import { provideMockStore } from '@ngrx/store/testing';
import * as _ from 'lodash';
import { defaultState } from '../../../../../../app.config';
import { MatCardModule } from '@angular/material';
import { MockSourceFormComponent } from '../../../../../../../test/components-stubs';
import { PipesModule } from '../../../../../pipes/pipes.module';

const state = _.cloneDeep(defaultState);

describe('DrugReviewComponent', () => {
  let component: DrugReviewComponent;
  let fixture: ComponentFixture<DrugReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DrugReviewComponent,
        MockSourceFormComponent
      ],
      providers: [
        provideMockStore({ initialState: state }),
      ],
      imports: [
        MatCardModule,
        PipesModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrugReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
