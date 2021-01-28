import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IllnessSearchComponent } from './illness-search.component';
import { SharedModule } from '../shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('IllnessSearchComponent', () => {
  let component: IllnessSearchComponent;
  let fixture: ComponentFixture<IllnessSearchComponent>;

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
    fixture = TestBed.createComponent(IllnessSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
