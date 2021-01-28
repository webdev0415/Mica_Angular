import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DosageComponent } from './dosage.component';
import { MatCheckboxModule, MatFormFieldModule, MatIconModule, MatListModule, MatSelectModule } from '@angular/material';
import { PolicyFormatPipe } from '../../../../../pipes/policy-format.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

xdescribe('DosageComponent', () => {
  let component: DosageComponent;
  let fixture: ComponentFixture<DosageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DosageComponent, PolicyFormatPipe ],
      imports: [ MatListModule, MatFormFieldModule, FormsModule, ReactiveFormsModule, MatSelectModule, MatCheckboxModule, MatIconModule ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DosageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
