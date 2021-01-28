import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EcwReviewsComponent } from './ecw-reviews.component';
import { NgRedux } from "@angular-redux/store";
import { defaultState } from "../../../../app.config";

const mockRedux = {
  getState: (): State.Root => defaultState,
};

describe('EcwReviewsComponent', () => {
  let component: EcwReviewsComponent;
  let fixture: ComponentFixture<EcwReviewsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcwReviewsComponent ],
      providers: [
        { provide: NgRedux, useValue: mockRedux }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcwReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
