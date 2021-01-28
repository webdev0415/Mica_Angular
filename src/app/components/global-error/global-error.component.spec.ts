import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalErrorComponent } from './global-error.component';
import {ErrorBoxComponent} from "../../modules/error-reporting/box/box.component";
import {RouterTestingModule} from "@angular/router/testing";

describe('GlobalErrorComponent', () => {
  let component: GlobalErrorComponent;
  let fixture: ComponentFixture<GlobalErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GlobalErrorComponent,
        ErrorBoxComponent
      ],
      imports: [
        RouterTestingModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
