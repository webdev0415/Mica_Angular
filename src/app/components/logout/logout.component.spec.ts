import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoutComponent } from './logout.component';
import {RouterTestingModule} from "@angular/router/testing";
import {AuthServiceStub} from "../../../test/services-stubs/auth.service.stub";
import {AuthService} from "../../services/auth.service";

describe('LogoutComponent', () => {
  let component: LogoutComponent;
  let fixture: ComponentFixture<LogoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogoutComponent ],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub }
      ],
      imports: [
        RouterTestingModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    component.ngOnDestroy();
  });
});
