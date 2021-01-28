import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiplierLoaderComponent } from './loader.component';

describe('MultiplierLoaderComponent', () => {
  let component: MultiplierLoaderComponent;
  let fixture: ComponentFixture<MultiplierLoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiplierLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiplierLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
