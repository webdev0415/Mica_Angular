import {
  activeCatData,
  nlpGroupIsActive,
  nlpSymptomsPage,
  totalNlpSymptoms,
  currentNlpSymptoms
} from "app/state/symptoms/symptoms.selectors";
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef, OnDestroy
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { Observable, Subscription } from "rxjs";
import * as _ from "lodash";
import { NgRedux, select } from "@angular-redux/store";
import { activeSymptomsIDs, symptomsInCatData, symptomDataMany } from "app/state/symptoms/symptoms.selectors";
import { POST_MSG } from "app/state/messages/messages.actions";
import { of } from "rxjs/observable/of";
import { debounceTime, distinctUntilChanged, map, pluck, startWith, switchMap } from "rxjs/operators";
import Subgroup2 = Symptom.Subgroup2;
import Subgroup1 = Symptom.Subgroup1;
import { SymptomService } from "app/services";

@Component({
  selector: "workbench-symptoms-list",
  templateUrl: "./symptoms-list.component.html",
  styleUrls: ["./symptoms-list.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SymptomsListComponent implements OnInit, OnDestroy {
  @Input() categoryID: string; // used when there is no active category ("pain" only at this point)
  @Input() bodyView: string;
  @Input() bodyParts: string[] = [];
  @Input() bodyPartsAll: string[] = [];

  @select(activeSymptomsIDs) activeSymptomsIDs: Observable<string[]>;
  @select(activeCatData) activeCatData: Observable<Workbench.Category>;

  groups: Observable<Symptom.Group>;
  navigating = false;
  searchControl = new FormControl("", [this.termValidator]);

  private symptomsData: Observable<Symptom.Data[]> = this.activeSymptomsIDs.pipe(switchMap(this.getSymptomData.bind(this)));
  private subs: Subscription[] = [];

  get activeBodyViewSymptoms() {
    return this.bodyView ? this.groups.pipe(pluck(this.bodyView.toLowerCase())) : of([])
  }
  get state() { return this.s.getState() }

  get total() {
    return totalNlpSymptoms(this.state);
  }

  get page() {
    return nlpSymptomsPage(this.state);
  }

  get nlpGroupIsActive(): boolean {
    return nlpGroupIsActive(this.state);
  }

  constructor(private s: NgRedux<State.Root>,
              private symptomService: SymptomService,
              private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.setGroups();
    if (this.nlpGroupIsActive) {
      this.subs.push(this.searchControl.valueChanges
        .pipe(
          debounceTime(800),
          distinctUntilChanged(),
          startWith(""),
        ).subscribe(value => {
          this.pageChanged(1, value);
        }));
    }
  }

  ngOnDestroy() {
      this.subs.forEach(sub => sub.unsubscribe())
  }

  pageChanged(page: number, term?: string) {
    if (this.searchControl.invalid)
      return;
    this.disablePagination();
    this.subs.push(this.symptomService
      .fetchNlpSymptoms(page, term)
      .subscribe(this.triggerChangeDetection.bind(this))
    );
  }

  termValidator(control: FormControl): {[key: string]: any} | null {
    const value: string = control.value;
    const re = /^[A-Z0-9]{3,}$/i;
    return !value || re.test(value) ? null : {term: {invalid: true}}
  };

  clearSearchField() {
    this.searchControl.setValue("");
  }

  trackByFn(index: number, value: Symptom.Data): string {
    return value.symptomID;
  }

  getBasicSymptomFromSubGroup(group1: Subgroup1, group2: Subgroup2): string | undefined {
    return group1.basicSymptomID ? group1.basicSymptomID : group2.basicSymptomID;
  }

  private setGroups() {
    this.groups = this.symptomsData
      .pipe(
        switchMap(this.getSymptoms.bind(this)),
        distinctUntilChanged(this.valuesAreEqual),
        map(this.groupAndReduceSymptoms.bind(this))
      );
  }

  private enablePagination() {
    this.navigating = false;
    this.cd.detectChanges();
  }

  /* istanbul ignore next */
  private disablePagination() {
    this.navigating = true;
    this.cd.detectChanges();

  }

  /* istanbul ignore next */
  private groupAndReduceSymptoms(symptomData: Symptom.Data[]): Symptom.Group {

    function groupName(input: string) { return input ? _.replace(input, /(^$|^\s$)/, "!ungrouped") : "!ungrouped" }

    return _.reduce(_.cloneDeep(symptomData), (result, symptom: Symptom.Data) => {
      const sbg = symptom.subGroups;

      if (sbg && (sbg.length !== 3 || !_.every(sbg, s => _.isString(s)))) {
        this.s.dispatch({
          type: POST_MSG,
          text: `Please contact support and quote:
          "Invalid subGroups in ${symptom.symptomID}: ${symptom.name}"`,
          options: { type: "error" }
        });

        return result;
      }

      const [view, sbg1Title, sbg2Title] = sbg ? _.map(sbg, n => groupName(n)) : ["!ungrouped", "!ungrouped", "!ungrouped"];

      if (!result[view]) {
        result[view] = [];
      }

      const sbg1 = _.find(result[view], { title: sbg1Title });

      if (sbg1) {
        if (this.isBasicForPainSwelling(symptom)) {
          sbg1.basicSymptomID = symptom.symptomID;
        }

        const sbg2 = _.find(sbg1.subgroup2, { title: sbg2Title });
        this.handleSbg2(symptom, sbg1, sbg2, sbg2Title);
      } else {
        const newSubgroup1: Symptom.Subgroup1 = {
          title: sbg1Title,
          subgroup2: [{title: sbg2Title, symptoms: [symptom]}]
        };

        if (this.isBasicForPainSwelling(symptom)) {
          newSubgroup1.basicSymptomID = symptom.symptomID;
        }

        const i = _.sortedIndexBy(result[view], newSubgroup1, "title");
        result[view].splice(i, 0, newSubgroup1);
      }

      return result;
    }, {} as Symptom.Group);
  };

  private isBasicForPainSwelling(symptom: Symptom.Data) {
    return symptom.painSwellingID === 8 || symptom.painSwellingID === 600;
    }

  private isBasic(symptom: Symptom.Data) {
    return symptom.painSwellingID === 8 || symptom.painSwellingID === 600 || symptom.painSwellingID === 800
  }

  private triggerChangeDetection() {
    this.setGroups();
    this.enablePagination();
  }

  private sortByBasic(symptoms: Symptom.Data[]) {
    const index = symptoms.findIndex(this.isBasic)
    if (index > 0)
      symptoms.unshift(...symptoms.splice(index, 1))
  }

  /* istanbul ignore next */
  private getSymptoms(ss: Symptom.Data[]): Observable<Symptom.Data[]> {
    if (nlpGroupIsActive(this.state)) {
      return of(currentNlpSymptoms(this.state));
    }
    if (ss && ss.length) {
      return of(ss);
    }
    if (this.categoryID) {
      return this.s.select(symptomsInCatData(this.categoryID))
    }
    return of([]);
  }

  private getSymptomData(ids: string[]) {
    return this.s.select(symptomDataMany(ids));
  }

  private valuesAreEqual = (x: any, y: any) => _.isEqual(x, y);

  private handleSbg2(symptom: Symptom.Data, sbg1: Subgroup1, sbg2: Subgroup2 | undefined, sbg2Title: string) {
    if (sbg2) {
      if (this.isBasic(symptom))
        sbg2.basicSymptomID = symptom.symptomID;
      const i = _.sortedIndexBy(sbg2.symptoms, symptom, (s) => s.name.toUpperCase());
      sbg2.symptoms.splice(i, 0, symptom);
      this.sortByBasic(sbg2.symptoms);
    } else {
      const newSubgroup2: Subgroup2 = {title: sbg2Title, symptoms: [symptom]};
      if (this.isBasic(symptom))
        newSubgroup2.basicSymptomID = symptom.symptomID;
      const i = _.sortedIndexBy(sbg1.subgroup2, newSubgroup2, "title");
      sbg1.subgroup2.splice(i, 0, newSubgroup2);
    }
  }

}
