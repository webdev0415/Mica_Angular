import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataValidationComponent } from './data-validation.component';
import {ErrorBoxComponent} from "../../../error-reporting/box/box.component";

describe('DataValidationComponent', () => {
  let component: DataValidationComponent;
  let fixture: ComponentFixture<DataValidationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DataValidationComponent,
        ErrorBoxComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
