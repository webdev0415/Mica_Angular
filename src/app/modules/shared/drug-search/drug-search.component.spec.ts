import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrugSearchComponent } from './drug-search.component';
import { SharedModule } from '../shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('DrugSearchComponent', () => {
  let component: DrugSearchComponent;
  let fixture: ComponentFixture<DrugSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        BrowserAnimationsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrugSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
