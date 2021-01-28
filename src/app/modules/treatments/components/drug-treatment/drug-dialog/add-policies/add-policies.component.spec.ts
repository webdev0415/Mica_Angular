import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPoliciesComponent } from './add-policies.component';
import { MatAutocompleteModule, MatDividerModule, MatInputModule, MatListModule, MatSelectModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { NgRedux } from '@angular-redux/store';
import { provideMockStore } from '@ngrx/store/testing';
import { StoreModule } from '@ngrx/store';
import * as _ from 'lodash';
import { defaultState } from '../../../../../../app.config';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const state = _.cloneDeep(defaultState);
const mockRedux = {
  getState: () => state,
  select: selector => of(selector(state)),
  dispatch: (arg: any) => {
  }
};

describe('AddPoliciesComponent', () => {
  let component: AddPoliciesComponent;
  let fixture: ComponentFixture<AddPoliciesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPoliciesComponent ],
      imports: [
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
        FormsModule,
        MatAutocompleteModule,
        MatDividerModule,
        MatListModule,
        BrowserAnimationsModule,
        StoreModule.forRoot([]),
      ],
      providers: [
        provideMockStore({ initialState: state }),
        { provide: NgRedux, useValue: mockRedux },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
