import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarningFormComponent } from './warning-form.component';

describe('WarningFormComponent', () => {
  let component: WarningFormComponent;
  let fixture: ComponentFixture<WarningFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarningFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarningFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
