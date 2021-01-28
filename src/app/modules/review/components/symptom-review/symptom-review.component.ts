import { deleteSymptom, completeSymptomGroup, saveSymptom } from "../../../../state/workbench/workbench.actions";
import { Observable } from "rxjs/Observable";
import { Router } from "@angular/router";
import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy } from "@angular/core";
import { FormControl, FormArray, FormGroup } from "@angular/forms"
import { trigger, state, style, animate, transition } from "@angular/animations";
import * as _ from "lodash";
import { Subscription } from "rxjs/Subscription";
import { NgRedux, select } from "@angular-redux/store";
import { isReadOnlyMode } from "../../../../state/task/task.selectors";
import { symptomsInCatData, symptomDataPath } from "../../../../state/symptoms/symptoms.selectors";
import { symptomsInCatValue, symptomValue } from "../../../../state/workbench/workbench.selectors";
import { ecwValidationMissingSymptomsInCat } from "../../../../state/ecw/ecw.selectors";
import { isReviewer } from "../../../../state/user/user.selectors";
import { addEcwValidationSymptom } from "../../../../state/ecw/ecw.actions";
import { distinctUntilChanged, filter, map, pluck } from "rxjs/operators";
import { combineLatest } from "rxjs/observable/combineLatest";
import RowValue = Symptom.RowValue;

@Component({
  animations: [
    trigger("fadeOut", [
      state("in", style({opacity: 1})),
      transition("in => out", [
        animate(500, style({opacity: 0}))
      ])
    ])
  ],
  selector: "symptom-review",
  templateUrl: "./symptom-review.component.html",
  styleUrls: ["./symptom-review.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SymptomReviewComponent implements OnInit, OnDestroy {
  @select(isReadOnlyMode) isReadOnlyMode: Observable<boolean>;
  @Input() symptomGroupID: string;
  @Input() categoryID: string;
  @Input() ecwValidationSymptoms: {[idx: string]: Symptom.Value} | null;
  isReviewer = isReviewer(this.state);
  modifierHeadings = ["Name", "Value"];
  tableHeadings = ["Bias", "Likelihood"];
  symptomStates: string[] = [];
  private subs: Subscription[] = [];
  symptomsValues: Symptom.Value[];
  groupedSymptoms: {name: string, symptoms: Symptom.Value[]}[] = [];
  controls: {[id: string]: FormArray} ;
  likelihoodValues =    [{name: 2}, {name: 20}, {name: 40}, {name: 60}, {name: 80}, {name: 98}];
  likelihoodValues100 = [{name: 0}, {name: 20}, {name: 40}, {name: 60}, {name: 80}, {name: 100}];

  get symptomsValue() {
    return combineLatest([
      this.s.select(symptomsInCatValue(this.categoryID)),
      this.s.select(ecwValidationMissingSymptomsInCat(this.symptomGroupID, this.categoryID))
    ])
    .pipe(
      map(([a, b]) => [...a, ...b]),
      map(this.addRowsForMultipliersAndModifiers.bind(this)),
      map(this.calcRows.bind(this))
    )
  }
  get symptomsData(): Observable<any> {
    return this.symptomsValue
      .pipe(
        distinctUntilChanged((x: any, y: any) => {
          return x.length !== y.length
        }),
        map(ss => {
          const data = symptomsInCatData(this.categoryID)(this.state);
          return _.filter(data, s => _.find(ss, { symptomID: s.symptomID }) as any)
        })
      );
  }
  getSymptomData(symptomID: string) { return this.symptomsData.pipe(map(d => _.find(d, {symptomID}))) }
  getSymptomProp(symptomID: string, prop: string) {
    return this.getSymptomData(symptomID).pipe(filter(v => !!v), pluck(prop));
  }
  private get state() {return this.s.getState()}

  constructor(private s: NgRedux<State.Root>,
              private router: Router) { }

  ngOnInit() {
    this.subs.push(this.symptomsValue.subscribe((ss: any) => {
      this.symptomStates = _.fill(Array(ss.length), "in", 0, ss.length + 1);
      this.symptomsValues = ss;

      if (this.isReviewer && !this.controls)
        this.generateControls(ss);

      this.groupedSymptoms = this.getGroupedSymptoms(ss);
    }));
  }

  ngOnDestroy() {
    _.each(this.subs, sub => sub.unsubscribe());
  }

  getGroupedSymptoms(ss: Symptom.Value[]) {
    const grouped: { [key: string ]: Symptom.Value[] } = {};
    const requiredSymptoms: Symptom.Value[] = [];
    const rootSymptoms: Symptom.Value[] = [];

    ss.forEach((sympt: Symptom.Value) => {
      if (sympt.isMissing) {
        requiredSymptoms.push(sympt);
        return;
      }
      if (!sympt.bodyParts) {
        rootSymptoms.push(sympt);
        return;
      }
      const key = sympt.bodyParts.join(" & ");
      if (!grouped[key])
        grouped[key] = [];
      grouped[key].push(sympt);
    });

    const groupedSymptoms = Object.entries(grouped)
      .sort((a, b) => b[0].length - a[0].length)
      .map(el => ({name: el[0], symptoms: el[1]}));

    if (rootSymptoms.length)
      groupedSymptoms.unshift({ name: "root", symptoms: rootSymptoms });

    if (requiredSymptoms.length)
      groupedSymptoms.push({ name: "Machine Learning Required Symptom", symptoms: requiredSymptoms });

    return groupedSymptoms;
  }

  onEditSymptomWorkbench(symptomID: string, ev: Event): void {
    ev.preventDefault();
    const loc: Symptom.LocationData = symptomDataPath(symptomID, this.symptomGroupID)(this.state);
    const queryParams = (this.symptomGroupID === "pain" || this.symptomGroupID === "physical") && loc.categoryName !== "Whole Body"
      ? { symptomID, bodyPart: loc.categoryName, viewName: loc.viewName}
      : { symptomID, viewName: loc.viewName };
    this.router.navigate(["/", "workbench", this.symptomGroupID], {queryParams})
      .catch(err => console.error("Unable to navigate to symptom: ", err));
  }


  /**
   * Deleting a symptom requires animation with callback
   */
  onSymptomDel(index: number, symptomID: string) {
    this.symptomStates[index] = "out";
  }
  symptomDelDispatch(i: number, symptomID: string) {
    if (this.symptomStates[i] === "out") {
      this.s.dispatch(completeSymptomGroup(this.symptomGroupID, false));
      if (this.categoryID !== "SYMPTCG33") {
        this.s.dispatch(addEcwValidationSymptom(symptomID, this.categoryID, this.symptomGroupID));
      }
      this.s.dispatch(deleteSymptom(
        symptomID,
        symptomDataPath(symptomID, null, this.categoryID === "SYMPTCG33")(this.state),
      ));
    }
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

      if (r.multiplier || r.bias || r.likelihood) {
        displayRows.push(root);
      }
      if (r.modifierValues && r.modifierValues.length) {
        displayRows.push(...r.modifierValues);
      }
      return displayRows;
    }, [] as Array<SourceInfo.SourceInfoType | Symptom.RowValue | Symptom.ModifierValue>);
  }

  rowValues(row: Symptom.RowValue): Array<string | number> {
    if (!row.hasOwnProperty("bias"))
      return [];
    const keys = [
      ["multiplier"],
      ["bias"],
      ["likelihood"],
      ...Array(6).fill("")
    ];

    return _.map(keys, ks => {
      const value = _.get(row, ks);
      if (!_.isUndefined(value)) return value.toString();
      return "";
    });
  }

  modifierDisplayValues(row: Symptom.ModifierValue): Array<string | number> {
    if (!row.hasOwnProperty("name"))
      return [];
    const keys = [
      ["likelihood"],
      ["name"],
    ];

    const name = row.name;
    if (name && (name.toLowerCase() === "ethnicity" || name.toLowerCase() === "recurs")) {
      keys.push(
        ["modifierValue"],
        ...Array(4).fill("")
    );
    } else {
      keys.push(["scale", "timeFrame"]);
    }

    return _.reduce(keys, (values, ks) => {
      const value = _.get(row, ks);
      values.push(!_.isUndefined(value) ? value.toString() : "");
      return values;
    }, ["", ""]);

  }

  symptomColorClass(symptomID: string): string {
    return this.ecwValidationSymptoms && !this.ecwValidationSymptoms[symptomID] ? "symptom-orange" : ""
  }

  private addRowsForMultipliersAndModifiers(symptoms: Symptom.Value[]): any {
    return symptoms.map(symptom => {
      if (!symptom.rows)
        return symptom;
      const symptomRows = symptom.rows
        .reduce((rows: RowValue[], rowVal: RowValue, rowIndex) => {
        const row = {...rowVal};
        const modifierValues = row.modifierValues || [];
        const newModifierValues = modifierValues.reduce((newValues, value, index) => {
          if (typeof value.modifierValue === "string") {
            const values = value.modifierValue.split(",");
            for (let i = 0; i < values.length; i++) {
              const currValue = values[i];
              newValues.push({...value, modifierValue: currValue, modIndex: index});
            }
          } else {
            newValues.push({...value, modIndex: index});
          }
          return newValues;
        }, [] as any);
        if (newModifierValues.length) {
          Object.assign(row, {modifierValues: newModifierValues})
        }
        if (row.multiplier && row.multiplier[0] && !this.isNumber(row.multiplier[0])) {
          // process the last value in multiplier array, so to display last value if there are more that one value in array
          // because country multiplier is returned as ["Americas", "North America", "United States", "Florida"]
          const multipliers = (row.multiplier[row.multiplier.length - 1] as string).split(",");
          for (let i = 0; i < multipliers.length; i++) {
            const multiplier = multipliers[i];
            const newRow = {...row, multiplier: [multiplier], rowIndex};
            rows.push(newRow);
          }
        } else {
          rows.push({...row, rowIndex} as RowValue);
        }
        return rows;
      }, []);
      return {
        ...symptom,
        rows: symptomRows
      }
    })
  }

  private calcRows(symptoms: Symptom.Value[]): Symptom.Value[] {
    return this.isReviewer
      ? symptoms
      : symptoms.map(s => s.rows ? {...s, rows: this.calculateRows(s.rows)} : s )
  }

  isInteger(num: number | string | undefined) {
    return num !== undefined && Number.isInteger(+num);
  }

  isNumber(val: number | string | null | undefined) {
    if (typeof(val) === "number") {
      return true;
    }
    if (!val) {
      return false;
    }
    return !!(val.length && isFinite(+val));
  }

  getLikelihoodCtrl(id: string, indexRow: number, indexMod?: number) {
    const controls = this.controls;
    const symptControls = this.controls[id];
    const control = symptControls.at(indexRow)
    // for debugg
    // if (!control) {
    //   console.log(id, indexRow, indexMod);
    //   console.log("symptControls", symptControls.value);
    //   console.log("symtom", symptomValue(id)(this.state));
    //   console.log("this.symptomsValues", this.symptomsValues.find(el => el.symptomID === id));
    //   return new FormControl();
    // }
    if (indexMod === undefined)
        return control.get("root")
    else {
      const values = control.get("values") as FormArray
        return values.at(indexMod)
    }
  }

  generateControls(s: Symptom.Value[]) {
    this.controls = {};

    s.forEach(ss => {
      const symptom = symptomValue(ss.symptomID)(this.state);
      if (!ss.rows || !symptom || !symptom.rows)
        return;
      const arrayControls = symptom.rows.map(row => {
       const control = new FormGroup({});
       if (this.isInteger(row.likelihood))
         control.addControl("root", new FormControl(row.likelihood));
       if (row.modifierValues)
         control.addControl("values", new FormArray(row.modifierValues.map(mod => new FormControl(mod.likelihood))));
       return control;
     });
     this.controls[ss.symptomID] = new FormArray(arrayControls);

     const sub = this.controls[ss.symptomID].valueChanges
       .pipe(
         distinctUntilChanged(this.valuesAreEqual)
       )
       .subscribe(this.onControlValueChange.bind(this, ss));
     this.subs.push(sub);
   })
  }

  private valuesAreEqual = (a: any, b: any) => _.isEqual(a, b);

  private onControlValueChange(ss: Symptom.Value, v: any) {
    const symptom = symptomValue(ss.symptomID)(this.state);
    if (!symptom)
      return;
    symptom.rows = symptom.rows.map((row, i) => {
      const r = v[i];
      if (r.root !== undefined)
        row.likelihood = r.root;
      if (row.modifierValues)
        row.modifierValues = row.modifierValues.map((mod, j) => ({
          ...mod,
          likelihood: r.values[j]
        }));
      return {...row}
    });
    this.s.dispatch(saveSymptom(symptom));
  }

}
