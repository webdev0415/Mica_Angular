import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input
} from "@angular/core";

@Component({
  selector: "templates-table-value",
  templateUrl: "./table-value.component.html",
  styleUrls: ["./table-value.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableValueComponent implements OnInit {
  @Input() required: boolean;
  @Input() value: string | number;
  @Input() label: string;
  @Input() controlDisabled: boolean;

  constructor() { }

  ngOnInit() {
  }

}
