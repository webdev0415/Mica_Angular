import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrugLikelihoodComponent } from './drug-likelihood.component';
import { SharedModule } from '../shared.module';
import { FormControl } from '@angular/forms';

describe('DrugLikelihoodComponent', () => {
  let component: DrugLikelihoodComponent;
  let fixture: ComponentFixture<DrugLikelihoodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrugLikelihoodComponent);
    component = fixture.componentInstance;
    component.likelihoodCtrl = new FormControl('');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
