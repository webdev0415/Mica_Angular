import { ClickOutsideDirective } from "./click-outside.directive";
import { DebugElement, Component, Directive } from "@angular/core";
import { ComponentFixture, TestBed, async, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

@Component({
  template: `
    <div micaClickOutside>
      <span></span>
    </div>
    <input />
  `
})

class TestComponent {
  onBlurFn() {}
 }

describe("Directive: ClickOutsideDirective", () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let directive: DebugElement;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        ClickOutsideDirective
      ]
    })
    .createComponent(TestComponent);
    component = fixture.componentInstance;
    directive = fixture.debugElement.query(By.directive(ClickOutsideDirective));
    fixture.detectChanges();
  });

  it("shoul create", () => {
    expect(directive.nativeElement).toBeDefined();
  })

  it("clickHandler should emit", () => {
    const dir = directive.injector.get(ClickOutsideDirective) as ClickOutsideDirective;
    const inputEl = fixture.debugElement.query(By.css("input"));
    const emitSpy = spyOn(dir.micaClickOutside, "emit");
    dir.clickHandler({target: inputEl.nativeElement} as any);
    expect(emitSpy).toHaveBeenCalled();
  })

  it("clickHandler should not emit", () => {
    const dir = directive.injector.get(ClickOutsideDirective) as ClickOutsideDirective;
    const spanEl = fixture.debugElement.query(By.css("span"));
    const emitSpy = spyOn(dir.micaClickOutside, "emit");
    dir.clickHandler({target: spanEl.nativeElement} as any);
    expect(emitSpy).not.toHaveBeenCalled();
  })

});
