// describe('InputTrimDirective', () => {
//   it('should create an instance', () => {
//     const directive = new InputTrimDirective();
//     expect(directive).toBeTruthy();
//   });
// });

import {TestBed, async, ComponentFixture, tick, fakeAsync} from "@angular/core/testing";
import {InputTrimDirective} from "./input-trim.directive";
import {Component, DebugElement} from "@angular/core";
import {By} from "@angular/platform-browser";

@Component({
  template: `<input type="text" [trim]="'hhhh'" (ngModelChange)="my"/>`
})
class TestTrimComponent {
  my: string;
}

describe("Directive: InputTrimDirective", () => {
  let fixture;
  let directive: DebugElement;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      declarations: [
        TestTrimComponent,
        InputTrimDirective
      ]
    })
      .createComponent(TestTrimComponent);
    directive = fixture.debugElement.query(By.directive(InputTrimDirective));
    fixture.detectChanges();
  });
  it("onKeydownEnter", () => {
    const elem = directive.nativeElement;
    const event = new KeyboardEvent('keydown', {
      'key': 'enter'
    });
    elem.dispatchEvent(event);
  });

  it("onInput", () => {
    const elem = directive.nativeElement;
    const event = new Event('input');
    elem.dispatchEvent(event);
  });

  it("onBlur", () => {
    const elem = directive.nativeElement;
    const event = new Event('blur');
    elem.dispatchEvent(event);
  });

  it("onKeydownEsc", () => {
    const elem = directive.nativeElement;
    const event = new KeyboardEvent('keydown', {
      'key': 'escape'
    });
    elem.dispatchEvent(event);
  });

  it("updateValue", () => {
    const dir = directive.injector.get(InputTrimDirective) as InputTrimDirective;
    dir.trim = "";
    const writeValueSpy = spyOn(dir, "writeValue").and.callThrough();
    dir["updateValue"]("", " 17");
    expect(writeValueSpy).toHaveBeenCalledWith("17")
  });
});


