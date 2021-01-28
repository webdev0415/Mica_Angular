import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalComponent } from './modal.component';
import {NgbActiveModal, NgbModule} from "@ng-bootstrap/ng-bootstrap";

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalComponent ],
      providers: [
        NgbActiveModal
      ],
      imports: [
        NgbModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    component.data = {
      title: "title",
      body: "body",
      actionTxt: "action text",
      actionName: "action name",
      cancelTxt: "cancel text"
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
