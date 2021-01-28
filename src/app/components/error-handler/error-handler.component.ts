import { ModalClosable } from "../modal/modal_closable";
import { Input, Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";

@Component({
  selector: "mita-error-handler",
  templateUrl: "./error-handler.component.html",
  styleUrls: ["./error-handler.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorHandlerModalComponent extends ModalClosable implements OnInit {
  @Input() private email: string;
  @Input() private message: string;

  set errorMessage(val: string) {
    this.message = val;
    this.cd.detectChanges();
  }
  get errorMessage() {
    return this.message;
  }

  set emailBody(val: string) {
    this.email = val;
    this.cd.detectChanges();
  }
  get emailBody() {
    return this.email;
  }

  constructor(private cd: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    this.errorMessage = this.message || "An error has been detected.";
    this.errorMessage = this.email;
  }

}
