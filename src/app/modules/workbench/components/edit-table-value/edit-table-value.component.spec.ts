import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTableValueComponent } from './edit-table-value.component';

describe('EditTableValueComponent', () => {
  let component: EditTableValueComponent;
  let fixture: ComponentFixture<EditTableValueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTableValueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTableValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
