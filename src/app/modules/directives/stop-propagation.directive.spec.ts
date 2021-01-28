import {Component, DebugElement} from "@angular/core";
import {StopPropagationDirective} from "./stop-propagation.directive";
import {TestBed} from "@angular/core/testing";
import {By} from "@angular/platform-browser";

@Component({
  template: `<input micaStopPropagation/>`
})
class TestStopPropagationComponent {

}

describe("Directive: StopPropagationDirective", () => {
  let fixture;
  let directive: DebugElement;
  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      declarations: [
        TestStopPropagationComponent,
        StopPropagationDirective
      ]
    })
      .createComponent(TestStopPropagationComponent);
    directive = fixture.debugElement.query(By.directive(StopPropagationDirective));
    fixture.detectChanges();
  });
  it("onClick", () => {
    const elem = directive.nativeElement;
    const event = new Event('click', {cancelable: true});
    const stopPropagationSpy = spyOn(event, "stopPropagation").and.callThrough();
    elem.dispatchEvent(event);
    expect(stopPropagationSpy).toHaveBeenCalled();
  });
});


