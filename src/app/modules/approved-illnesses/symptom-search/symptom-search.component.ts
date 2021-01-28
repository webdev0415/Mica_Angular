import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild, OnDestroy} from "@angular/core";
import {debounceTime} from "rxjs/operators";
import {findSymptomLive} from "../../../state/symptoms/symptoms.selectors";
import * as _ from "lodash";
import {NgRedux} from "@angular-redux/store";
import {FormControl, Validators} from "@angular/forms";
import {BehaviorSubject, Subscription} from "rxjs/Rx";

@Component({
  selector: "mica-symptom-search",
  templateUrl: "./symptom-search.component.html",
  styleUrls: ["./symptom-search.component.sass"],
  host: {"(document:click)": "handleClick($event)"},
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SymptomSearchComponent implements OnInit, OnDestroy {
  @ViewChild("input", {static: false})
  inputRef: ElementRef;
  @ViewChild("ul", {static: false})
  ulRef: ElementRef;
  focusOnSearch = false;
  searchCtrl = new FormControl("", Validators.required);
  searching = false;
  searchFailed = false;
  searchResults: BehaviorSubject<MICA.SelectableEl[]> = new BehaviorSubject([]);
  private subs: Subscription[] = [];
  symptomData: any;
  sympSelected = false;
  private get state() { return this.s.getState(); }

  constructor(private s: NgRedux<State.Root>,
              private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.subs.push(this.searchCtrl.valueChanges
      .pipe(
        debounceTime(100)
      )
      .subscribe(this.onSearchCtrlChange.bind(this)));
  }

  ngOnDestroy() {
    _.each(this.subs, s => s.unsubscribe());
  }

  /* istanbul ignore next */
  handleClick(event: any) {
    const targetElem = event.target;
    const input = this.inputRef.nativeElement;
    const ul = this.ulRef.nativeElement;

    if (!(targetElem === input || targetElem.parentNode === ul)) {
      this.focusOnSearch = false;
    }
  }

  onSelect(symptomID: string, symptomName: string) {
    this.searchCtrl.setValue(symptomID, {
      emitEvent: false
    });
    this.searching = true;
    this.focusOnSearch = false;
    this.symptomData = { symptomID, symptomName };
    this.sympSelected = true;
    this.searching = false;
    this.cd.detectChanges();
  }

  onClose() {
    this.searchCtrl.setValue("");
    this.searchFailed = false;
    this.sympSelected = false;
    this.symptomData = {
      symptomName: "",
      symptomID: "",
    };
    const input = this.inputRef.nativeElement;
    input.focus();
    this.focusOnSearch = true;
  }

  private onSearchCtrlChange(term: string) {
    if (!term.length) {
      if (this.searchResults.value.length) this.searchResults.next([]);
      this.searchFailed = false;
      this.cd.detectChanges();
      return;
    }
    this.focusOnSearch = true;
    this.searchFailed = false;
    const nextValues = _.map(findSymptomLive(term)(this.state), s => {
      return {name: s.name, value: s.symptomID}
    });
    this.searchResults.next(_.take(nextValues, 20));
    if (!nextValues.length) {
      this.searchFailed = true;
      this.symptomData = {
        symptomName: "",
        symptomID: "",
      };
      this.cd.detectChanges();
    }
  }
}
