import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeIconComponent } from './badge-icon.component';
import {TitleCasePipe} from "../../../pipes/title-case.pipe";

describe('BadgeIconComponent', () => {
  let component: BadgeIconComponent;
  let fixture: ComponentFixture<BadgeIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        BadgeIconComponent,
        TitleCasePipe
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgeIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
