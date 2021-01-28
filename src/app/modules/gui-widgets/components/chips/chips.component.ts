import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from "@angular/core";

@Component({
  selector: "mica-chips",
  templateUrl: "./chips.component.html",
  styleUrls: ["./chips.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChipsComponent implements OnInit {
  @Input() values: string[];
  @Input() badgeClass = "default";
  @Input() size = "";
  @Input() pill = false;

  @Output() remove: EventEmitter<string> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  private get chipsClass(): string {
    return `${this.pill ? "badge-pill" : ""} badge-${this.badgeClass} ${this.size}`;
  }

}
