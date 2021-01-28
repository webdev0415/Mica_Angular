import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarningListComponent } from './warning-list.component';

describe('WarningListComponent', () => {
  let component: WarningListComponent;
  let fixture: ComponentFixture<WarningListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarningListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarningListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
