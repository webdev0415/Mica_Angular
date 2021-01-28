import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IconComponent } from './icon.component';
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {NgRedux, NgReduxModule} from "@angular-redux/store";
import * as workbenchSelectors from "../../../state/workbench/workbench.selectors";
import {Observable} from "rxjs";
import {navInit} from "../../../app.config";
import {NgReduxTestingModule} from "@angular-redux/store/testing";
import {of} from "rxjs/observable/of";
const fakeUsers = require("../../../../test/data/users.json");

const mockRedux = {
  getState: () => {
    return {
      user: fakeUsers[0],
      nav: navInit
    }
  },
  dispatch: (arg: any) => {}
};

describe('IconComponent', () => {
  let component: IconComponent;
  let fixture: ComponentFixture<IconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IconComponent ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        { provide: NgReduxModule, useClass: NgReduxTestingModule }
      ],
      imports: [
        NgbModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconComponent);
    component = fixture.componentInstance;
    component.errors = of(['val1', 'val2', 'val3']);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
