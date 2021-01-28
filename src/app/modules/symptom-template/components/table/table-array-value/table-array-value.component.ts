import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input
} from "@angular/core";
import { FormGroup } from "@angular/forms";

@Component({
  selector: "templates-table-array-value",
  templateUrl: "./table-array-value.component.html",
  styleUrls: ["./table-array-value.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableArrayValueComponent implements OnInit {
  @Input() required: boolean;
  @Input() values: string[] | number[];
  @Input() label: string;
  @Input() ctrl: FormGroup;

  constructor() { }

  ngOnInit() {
  }

}
