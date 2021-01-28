import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueSwitchComponent } from './value-switch.component';
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";

describe('ValueSwitchComponent', () => {
  let component: ValueSwitchComponent;
  let fixture: ComponentFixture<ValueSwitchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValueSwitchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValueSwitchComponent);
    component = fixture.componentInstance;
    component.values = [0, 5];
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it("should throw error", () => {
    component.values = null;
    expect(() => component.ngOnInit()).toThrow();
  });

  it("writeValue", () => {
    expect(component.writeValue(undefined)).toBeUndefined();
  });
});
