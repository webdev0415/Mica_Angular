import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineSpinnerComponent } from './inline-spinner.component';

describe('InlineSpinnerComponent', () => {
  let component: InlineSpinnerComponent;
  let fixture: ComponentFixture<InlineSpinnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineSpinnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
