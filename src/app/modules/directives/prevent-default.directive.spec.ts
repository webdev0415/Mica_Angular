import {Component, DebugElement} from "@angular/core";
import {PreventDefaultDirective} from "./prevent-default.directive";
import {TestBed} from "@angular/core/testing";
import {By} from "@angular/platform-browser";

@Component({
  template: `<input micaPreventDefault/>`
})
class TestPreventDefaultComponent {

}

describe("Directive: PreventDefaultDirective", () => {
  let fixture;
  let directive: DebugElement;
  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      declarations: [
        TestPreventDefaultComponent,
        PreventDefaultDirective
      ]
    })
      .createComponent(TestPreventDefaultComponent);
    directive = fixture.debugElement.query(By.directive(PreventDefaultDirective));
    fixture.detectChanges();
  });
  it("click", () => {
    const elem = directive.nativeElement;
    const event = new Event('click', {cancelable: true});
    elem.dispatchEvent(event);
    expect(event.defaultPrevented).toEqual(true);
  });
});


