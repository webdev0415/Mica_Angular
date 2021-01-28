import { findSymptomLive } from "app/state/symptoms/symptoms.selectors";
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  Input,
  Output,
  EventEmitter, SimpleChanges, HostListener, OnChanges
} from "@angular/core";
import {
  FormControl,
  Validators
} from "@angular/forms";
import { NgRedux } from "@angular-redux/store";
import { BehaviorSubject, Subscription, throwError } from "rxjs";
import * as _ from "lodash";
import { TemplateService } from "app/services/template.service";
import {
  upgradeSymptomTemplates
} from "app/state/symptom-templates/templates.actions";
import { catchError, debounceTime, finalize } from "rxjs/operators";

@Component({
  selector: "mica-template-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateSearchComponent implements OnInit, OnChanges, OnDestroy {
  @Input() clearSearchOnSelect = true;
  @Input() searchQuery: string;
  @Output() selectedItem: EventEmitter<MICA.SelectableEl> = new EventEmitter();
  @ViewChild("input", {static: false}) inputRef: ElementRef;
  @ViewChild("ul", {static: false}) ulRef: ElementRef;

  focusOnSearch = false;
  searchCtrl = new FormControl("", Validators.required);
  searching = false;
  searchFailed = false;
  searchResults: BehaviorSubject<MICA.SelectableEl[]> = new BehaviorSubject([]);
  searchSub: Subscription;

  private subs: Subscription[] = [];
  private get state() { return this.s.getState(); }

  constructor(private template: TemplateService,
              private s: NgRedux<State.Root>,
              private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.searchSub = this.getSearchSub();
    this.subs.push(this.searchSub);
  }

  ngOnChanges(changes: SimpleChanges) {
    const { searchQuery } = changes;
    if (searchQuery && searchQuery.currentValue && searchQuery.currentValue !== this.searchCtrl.value) {
      this.searchSub.unsubscribe();
      this.searchResults.next([]);
      this.searchCtrl.setValue(searchQuery.currentValue);
      this.searchSub = this.getSearchSub();
    } else if (searchQuery && !searchQuery.currentValue) {
      this.searchCtrl.setValue("");
    }
  }

  ngOnDestroy() {
    _.each(this.subs, s => s.unsubscribe());
  }

  @HostListener("document:click", ["$event"])
  /* istanbul ignore next */
  handleClick(event: any) {
    const targetElem = event.target;
    const input = this.inputRef.nativeElement;
    const ul = this.ulRef.nativeElement;

    if (!(targetElem === input || targetElem.parentNode === ul)) {
      this.focusOnSearch = false;
    }
  }

  onSearch(symptomID: string) {
    this.searching = true;
    this.focusOnSearch = false;
    this.s.dispatch(upgradeSymptomTemplates(null));
    this.template.getTemplate(symptomID)
      .pipe(
        finalize(() => {
          this.searching = false;
          this.cd.detectChanges();
        }),
        catchError(this.handleGetTemplateError)
      )
      .subscribe(
        this.handleGetTemplate.bind(this)
      )
  }

  onSelectValue(result: any) {
    this.selectedItem.emit(result);
  }

  onClose() {
    this.searchCtrl.setValue("");
    this.searchFailed = false;
    const input = this.inputRef.nativeElement;
    input.focus();
    this.focusOnSearch = true;
  }

  private getSearchSub() {
    return this.searchCtrl.valueChanges
      .pipe(
        debounceTime(100)
      )
      .subscribe(this.onSearchCtrlChange.bind(this));
  }

  private onSearchCtrlChange(term: string) {
    if (!term.length) {
      if (this.searchResults.value.length) this.searchResults.next([]);
      return;
    }

    const nextValues = _.map(findSymptomLive(term)(this.state), s => {
      return {name: s.name, value: s.symptomID}
    });

    this.focusOnSearch = true;
    this.searchFailed = false;
    this.searchResults.next(_.take(nextValues, 20));

    if (!nextValues.length) this.searchFailed = true;
  }

  private handleGetTemplate(template: Symptom.Template) {
    this.s.dispatch(upgradeSymptomTemplates(template || null));
    this.searchResults.next([]);
    this.searchCtrl.setValue("");
  }

  private handleGetTemplateError(err: any) {
    return throwError(err);
  }
}
