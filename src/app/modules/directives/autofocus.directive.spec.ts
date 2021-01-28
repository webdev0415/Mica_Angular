/* tslint:disable:no-unused-variable */

import {TestBed, async, ComponentFixture} from '@angular/core/testing';
import { AutofocusDirective } from './autofocus.directive';
import {Component, DebugElement} from "@angular/core";
import {By} from "@angular/platform-browser";

@Component({
  template: `<input type="text" mica-autofocus/><input id="r"/>`
})
class TestAutofocusComponent {
}

describe('Directive: AutofocusDirective', () => {
  let component: TestAutofocusComponent;
  let fixture: ComponentFixture<TestAutofocusComponent>;
  let directive: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestAutofocusComponent,
        AutofocusDirective
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestAutofocusComponent);
    component = fixture.componentInstance;
    directive = fixture.debugElement.query(By.directive(AutofocusDirective));
    fixture.detectChanges();
  });

  it('should set focus', () => {
    expect(directive.nativeElement).toEqual(document.activeElement);
  });
});
