import {
  Directive, EventEmitter, HostListener, Input, Output
} from "@angular/core";
import { DefaultValueAccessor } from "@angular/forms";

@Directive( {
  selector: "input[uppercase]",
} )
export class InputUppercaseDirective extends DefaultValueAccessor {
  // this property is necessary to update the model.
  @Output() ngModelChange: EventEmitter<any> = new EventEmitter();

  /**
   * Updates the value on events.
   */
  @HostListener( "blur", ["$event.type", "$event.target.value"] )
  onBlur( event: string, value: string ): void {
    this.updateValue( event, value );
  }

  @HostListener( "input", ["$event.type", "$event.target.value"] )
  onInput( event: string, value: string ): void {
    this.updateValue( event, value, false );
  }

  @HostListener( "keydown.enter", ["$event.type", "$event.target.value"] )
  onKeydownEnter( event: string, value: string ): void {
    this.updateValue( event, value );
  }

  @HostListener( "keydown.esc", ["$event.type", "$event.target.value"] )
  onKeydownEsc( event: string, value: string ): void {
    this.updateValue( event, value );
  }

  /**
   * Upper cases an input value, and sets it to the model and element.
   *
   * @param {string} value - input value
   * @param {string} event - input event
   */
  private updateValue( event: string, value: string, trim = true ): void {
    value = value.toUpperCase();
    this.ngModelChange.emit( value );
    this.writeValue( value );
  }

}
