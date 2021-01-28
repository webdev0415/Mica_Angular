import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy } from "@angular/core";
import { trigger, state, style, animate, transition } from "@angular/animations";
import * as _ from "lodash";
import { Subscription } from "rxjs/Subscription";
import { NgRedux } from "@angular-redux/store";
import { symptomData} from "../../../../state/symptoms/symptoms.selectors";
import { symptomsFromActiveIllness } from "./../../../../state/ecw/ecw.selectors";
import { deleteEcwSymptom } from "../../../../state/ecw/ecw.actions";
import { pluck } from "rxjs/operators";

@Component({
  animations: [
    trigger("fadeOut", [
      state("in", style({opacity: 1})),
      transition("in => out", [
        animate(500, style({opacity: 0}))
      ])
    ])
  ],
  selector: "ecw-symptom-review",
  templateUrl: "./ecw-symptom-review.component.html",
  styleUrls: ["./ecw-symptom-review.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EcwSymptomReviewComponent implements OnInit, OnDestroy {
  @Input() symptomsIDs: string[];
  @Input() categoryID: string;
  modifierHeadings = ["Name", "Value", "Start", "End", "Unit", "Slope"];
  tableHeadings = ["Bias", "Likelihood"];
  symptomStates: string[] = [];
  private subs: Subscription[] = [];

  private get state() { return this.s.getState() }
  get symptomsValues() {

    return this.symptomsIDs.length
      ? this.symptomsIDs.map(sID => symptomsFromActiveIllness(this.state)[sID])
      : []
  }

  constructor(private s: NgRedux<State.Root>) { }

  ngOnInit() {
    this.resetStates()
  }

  symptomMeta(symptomID: string, key: string) {
    return this.s.select(symptomData(symptomID)).pipe(pluck(key));
  }

   onSymptomDel(index: number, symptomID: string) {
    this.symptomStates[index] = "out";
  }


  symptomDelDispatch(i: number, symptomID: string) {
    if (this.symptomStates[i] === "out") {
      this.s.dispatch(deleteEcwSymptom(
        symptomID,
        this.categoryID
      ));
      this.resetStates()
    }
  }

  resetStates() {
    this.symptomStates = this.symptomsIDs.map(() => "in");
  }

  editIllness(symptomID: string, ev: Event) {
    ev.preventDefault();
  }
  ngOnDestroy() {
  }


  trackByFn(index: number, value: Symptom.RowValue): number {
    return index;
  }

  /**
   * Value parsers
   */

  calculateRows(rows: Symptom.RowValue[]): any {
    return _.reduce(rows, (displayRows, r: any) => {
      const root = _.cloneDeep(r);
      displayRows.push(r);
      if (r.modifierValues && r.modifierValues.length) displayRows.push(...r.modifierValues);
      return displayRows;
    }, [] as Array<any>);
  }

  rowValues(row: Symptom.RowValue | Symptom.ModifierValue): Array<string | number> {
    if ((<Symptom.ModifierValue>row).name) return [];
    const keys = [
      ["multiplier"],
      ["bias"],
      ["likelihood"]
    ];

    return _.map(keys, ks => {
      const value = _.get(row, ks);
      if (!_.isUndefined(value)) return value.toString();
      return "";
    });
  }

  modifierDisplayValues(row: Symptom.RowValue | Symptom.ModifierValue): Array<string | number> {
    if (_.has((<Symptom.RowValue>row), "bias")) return [];
    const keys = [
      ["likelihood"],
      ["name"],
    ];

    const name = (<Symptom.ModifierValue>row).name;
    if (name && name.toLowerCase() === "ethnicity") {
      keys.push(["modifierValue"]);
    } else {
      keys.push(["scale", "value"],
        ["scale", "scaleTimeLimitStart"],
        ["scale", "upperTimeLimit"],
        ["scale", "timeUnit"],
        ["scale", "slope"]);
    }

    return _.reduce(keys, (values, ks) => {
      const value = _.get(row, ks);
      values.push(!_.isUndefined(value) ? value.toString() : "");
      return values;
    }, ["", ""]);

  }

}
