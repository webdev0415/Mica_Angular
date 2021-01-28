import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from "@angular/core";

@Component({
  selector: "mica-error-box",
  templateUrl: "./box.component.html",
  styleUrls: ["./box.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorBoxComponent implements OnInit {
  @Input() message: string;
  @Input() retryAllowed = false;
  @Output() retry: EventEmitter<boolean> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  get emailBody(): string {
    return encodeURIComponent(`An error has been detected in MICA. ${this.message}`);
  }

}
