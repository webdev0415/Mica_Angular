import {TestBed} from "@angular/core/testing";
import {Component, DebugElement} from "@angular/core";
import {By} from "@angular/platform-browser";
import {InputUppercaseDirective} from "./input-uppercase.directive";

@Component({
  template: `<input type="text" uppercase (ngModelChange)="my"/>`
})
class TestUppercaseComponent {
  my: string;
}

describe("Directive: InputUppercaseDirective", () => {
  let fixture;
  let directive: DebugElement;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      declarations: [
        TestUppercaseComponent,
        InputUppercaseDirective
      ]
    })
      .createComponent(TestUppercaseComponent);
    directive = fixture.debugElement.query(By.directive(InputUppercaseDirective));
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
    const dir = directive.injector.get(InputUppercaseDirective) as InputUppercaseDirective;
    const writeValueSpy = spyOn(dir, "writeValue").and.callThrough();
    dir["updateValue"]("", "abc");
    expect(writeValueSpy).toHaveBeenCalledWith("ABC")
  });
});


