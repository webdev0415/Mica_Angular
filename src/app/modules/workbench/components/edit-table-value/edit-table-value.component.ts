import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input
} from "@angular/core";

@Component({
  selector: "edit-table-value",
  templateUrl: "./edit-table-value.component.html",
  styleUrls: ["./edit-table-value.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditTableValueComponent implements OnInit {
  @Input() required: boolean;
  @Input() value: string | number;
  @Input() label: string;

  constructor() { }

  ngOnInit() {
  }

}
