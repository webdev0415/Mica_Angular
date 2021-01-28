import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef,
  ElementRef, ViewChild, HostListener
} from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { NgRedux } from "@angular-redux/store";
import { Router } from "@angular/router";
import { BehaviorSubject, Subscription } from "rxjs";
import * as _ from "lodash";
import { findSymptomEnhanced, symptomDataPath } from "app/state/symptoms/symptoms.selectors";
import { debounceTime } from "rxjs/operators";

@Component({
  selector: "mica-symptom-search",
  templateUrl: "./symptom-search.component.html",
  styleUrls: ["./symptom-search.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SymptomSearchComponent implements OnInit, OnDestroy {
  @ViewChild("input", {static: false}) inputRef: ElementRef;
  @ViewChild("ul", {static: false}) ulRef: ElementRef;

  focusOnSearch = false;
  searchCtrl = new FormControl("", Validators.required);
  searching = false;
  searchFailed = false;
  searchResults: BehaviorSubject<MICA.SelectableEl[]> = new BehaviorSubject([]);

  private subs: Subscription[] = [];
  private get state() { return this.s.getState(); }

  constructor(private s: NgRedux<State.Root>,
              private cd: ChangeDetectorRef,
              private router: Router,
            ) { }

  ngOnInit() {
    this.subs.push(
      this.searchCtrl.valueChanges.pipe(
        debounceTime(100)
      ).subscribe(term => {
        if (!term.length) {
          if (this.searchResults.value.length) this.searchResults.next([]);
          return;
        }
        this.focusOnSearch = true;
        this.searchFailed = false;
        const nextValues = _.map(findSymptomEnhanced(term)(this.state), s => {
          return {name: s.name, value: s.symptomID}
        });
        this.searchResults.next(_.take(nextValues, 20));
        if (!nextValues.length) this.searchFailed = true;
      }));
  }

  ngOnDestroy() {
    _.each(this.subs, s => s.unsubscribe());
  }

  @HostListener("document:click", ["$event"])
  handleClick(event: any) {
    const targetElem = event.target;
    const input = this.inputRef.nativeElement;
    const ul = this.ulRef.nativeElement;

    if (!(targetElem === input || targetElem.parentNode === ul)) {
      this.focusOnSearch = false;
    }
  }

  onSelect(symptomID: string) {
    this.searching = true;
    this.focusOnSearch = false;
    this.onEditSymptomWorkbench(symptomID);
    this.searching = false;
  }

  onEditSymptomWorkbench(symptomID: string): void {
    const loc: Symptom.LocationData = symptomDataPath(symptomID)(this.state);
    const symptomGroupID = loc.symptomGroup;
    const queryParams = this.getQueryParams(loc, symptomID);

    this.router.navigate(["/", "workbench", symptomGroupID], { queryParams })
      .catch(this.onNavigateError);
  }

  onClose() {
    const input = this.inputRef.nativeElement;

    this.searchCtrl.setValue("");
    this.searchFailed = false;
    input.focus();
    this.focusOnSearch = true;
  }

  private getQueryParams(loc: Symptom.LocationData, symptomID: string) {
    return (loc.symptomGroup === "pain" || loc.symptomGroup === "physical") && loc.categoryName !== "Whole Body"
      ? { symptomID, bodyPart: loc.categoryName, viewName: loc.viewName}
      : { symptomID, viewName: loc.viewName }
  }

  private onNavigateError(err: any) {
    console.error("Unable to navigate to symptom: ", err);
  }
}
