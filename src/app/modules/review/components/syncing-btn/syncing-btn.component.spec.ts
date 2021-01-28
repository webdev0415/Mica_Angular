import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncingBtnComponent } from './syncing-btn.component';
import {InlineSpinnerComponent} from "../../../spinner/inline-spinner/inline-spinner.component";

describe('SyncingBtnComponent', () => {
  let component: SyncingBtnComponent;
  let fixture: ComponentFixture<SyncingBtnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SyncingBtnComponent,
        InlineSpinnerComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SyncingBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
