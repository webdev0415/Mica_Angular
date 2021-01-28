import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UniquenessModalComponent } from './uniqueness-modal.component';
import {NgbActiveModal, NgbModule} from "@ng-bootstrap/ng-bootstrap";

describe('UniquenessModalComponent', () => {
  let component: UniquenessModalComponent;
  let fixture: ComponentFixture<UniquenessModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UniquenessModalComponent ],
      providers: [
        NgbActiveModal
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UniquenessModalComponent);
    component = fixture.componentInstance;
    component.illnesses = ["illness1", "illness2", "illness3"];
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
