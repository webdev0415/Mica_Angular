import { Component, OnInit, ChangeDetectionStrategy, Input } from "@angular/core";
import { NgRedux } from "@angular-redux/store";
import { FormArray, FormGroup } from "@angular/forms";
import * as _ from "lodash";

@Component({
  selector: "templates-multiplier-value",
  templateUrl: "./multiplier-value.component.html",
  styleUrls: ["./multiplier-value.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiplierValueComponent implements OnInit {
  @Input() arrCtrl: FormGroup[];
  @Input() title: string;

  cellEdit: [number, number]; // [row, column]
  private get state() { return this.s.getState() }

  constructor(private s: NgRedux<State.Root>) { }

  ngOnInit() {
  }

  trackByFn(index: number, value: Workbench.DataStoreRefTypeValue): string {
    return value.name;
  }

  get antithesisMinMax(): [number, number] {
    const metadata = _.find(this.state.symptomTemplates.editableProperties, {"name": "antithesis"});
    return metadata && metadata.minMax ? metadata.minMax : [-1, -1];
  }

  isCellEdit(edit: [number, number]): boolean {
    return _.isEqual(edit, this.cellEdit);
  }

}
