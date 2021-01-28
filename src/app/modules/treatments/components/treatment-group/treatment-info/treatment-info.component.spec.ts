import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentInfoComponent } from './treatment-info.component';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { PipesModule } from '../../../../pipes/pipes.module';
import { provideMockStore } from '@ngrx/store/testing';
import * as _ from 'lodash';
import { defaultState } from '../../../../../app.config';
import { MockSourceFormComponent } from '../../../../../../test/components-stubs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const state = _.cloneDeep(defaultState);

describe('TreatmentInfoComponent', () => {
  let component: TreatmentInfoComponent;
  let fixture: ComponentFixture<TreatmentInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatListModule,
        MatDividerModule,
        PipesModule,
        FormsModule,
        ReactiveFormsModule
      ],
      declarations: [
        TreatmentInfoComponent,
        MockSourceFormComponent
      ],
      providers: [
        provideMockStore({ initialState: state }),
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreatmentInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
