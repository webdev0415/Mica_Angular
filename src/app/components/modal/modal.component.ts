import {
  Component,
  ChangeDetectionStrategy,
  ComponentRef,
  ViewContainerRef,
  ViewChild, Input, OnDestroy, Renderer2, AfterViewChecked
} from "@angular/core";

@Component({
  selector: "mica-modal",
  templateUrl: "./modal.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent implements OnDestroy, AfterViewChecked {
  @Input() content: ComponentRef<any>;
  @Input() closeModal: Function;
  @ViewChild("content", { static: false, read: ViewContainerRef }) private target: ViewContainerRef;

  private checked = false;

  constructor(private renderer: Renderer2) {
  }

  ngAfterViewChecked() {
    if (this.checked) {
      return;
    }

    this.checked = true;
    this.target.insert(this.content.hostView);
    this.renderer.addClass(document.body, "modal-open");
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, "modal-open");
  }
}
