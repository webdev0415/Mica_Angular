import { ChangeDetectorRef, Component, Input, Output, EventEmitter, OnDestroy,
  OnInit, AfterViewInit, ChangeDetectionStrategy, forwardRef, TemplateRef,
  ViewChild, ElementRef } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  FormControl,
  Validators
} from '@angular/forms';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import * as _ from 'lodash';
import { select, NgRedux } from '@angular-redux/store';
import { ApiService } from './api.service';
import { DropdownContext } from './dropdown/dropdown.component';
import { of } from 'rxjs/observable/of';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError, debounceTime, distinctUntilChanged, filter, finalize, flatMap, map, switchMap, tap } from 'rxjs/operators';
import { icd10CodeValidator } from 'app/util/forms/validators/icd10Code';
import SelectableEl = MICA.SelectableEl;

@Component({
  selector: 'mica-typeahead',
  templateUrl: './typeahead.component.html',
  styleUrls: ['./typeahead.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TypeaheadComponent),
      multi: true
    }, {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TypeaheadComponent),
      multi: true
    }
  ]
})
export class TypeaheadComponent implements OnInit, OnDestroy, AfterViewInit, ControlValueAccessor {
  @Input() readOnly = false;
  @Input() title = '';
  @Input() enableValidation = true;
  @Input() canClose = true;
  @Input() small = false;
  @Input() typeAheadMin = 2;
  @Input() valueValid: string;
  @Input() excludeItems: string[] = [];
  @Input() resultKey: 'name' | 'value';
  @Input() placeholder = 'Search...';
  @Input() items: MICA.SelectableEl[]; // will be of type static
  @Input() urlQuery = '';
  @Input() liveSearchType: MICA.LiveSearchType; // will be of type liveSearch
  @Input() templateRef: TemplateRef<DropdownContext>;
  @Input() dropdownAlignment = 'left';
  @Input() sortByKey: string | string[] = 'name';
  @Input() required = true;
  @Input() formControl: any;
  @Input() removeSelectedValues = true;
  @Input() icd10CodeSearch: boolean;
  @Input() maxLength: number;

  @Output() close: EventEmitter<boolean> = new EventEmitter();
  @Output() select: EventEmitter<string | number> = new EventEmitter();
  @Output() noSearch: EventEmitter<boolean> = new EventEmitter();
  @Output() searching: BehaviorSubject<boolean> = new BehaviorSubject(false);
  @Output() searchInputChanges: EventEmitter<void> = new EventEmitter();

  @ViewChild('searchInput', { static: false }) searchInput: ElementRef;
  @select(['symptoms', 'multiplier', 'typeahead']) searchCache$: Observable<State.TypeaheadState>;
  showDropdown = true;
  ctrl = new FormControl('');
  selectCrl = new FormControl('', [Validators.required]);
  searchFailed = false;
  initialState = false;
  selectableItems: BehaviorSubject<MICA.SelectableEl[]> = new BehaviorSubject([]);
  private subs: Subscription[] = [];
  private valueSub: Subscription;
  propagateChange = (_: any) => {};
  registerOnChange(fn: (_: any) => {}) { this.propagateChange = fn; }
  registerOnTouched() {}
  writeValue(value: string | number) {if (value !== undefined) this.ctrl.setValue(value); }
  get state() { return this.s.getState(); }

  constructor(private s: NgRedux<State.Root>,
              private cd: ChangeDetectorRef,
              private api: ApiService) {
  }

  get notFound() {
    return this.selectableItems.value.length === 0
      && (this.ctrl.value && (this.ctrl.value.length >= this.typeAheadMin))
      && !this.searching.value
      && this.searchFailed;
  }

  ngOnInit() {
    if (this.enableValidation) {
      const validators = [];

      this.required && validators.push(Validators.required);
      this.icd10CodeSearch && validators.push(icd10CodeValidator);
      this.ctrl.setValidators(validators);
      this.ctrl.updateValueAndValidity();
    }

    if (this.formControl) {
      if (this.formControl.value) {
        this.initialState = true;
        this.searchFailed = false;
      }
    }

    this.valueSub = this.valueSubFactory;

    this.subs.push(
      this.selectCrl.valueChanges
        .pipe(
          filter(this.valueExists)
        )
        .subscribe(this.onSelectCtrlChange.bind(this)),

      this.ctrl.valueChanges.subscribe(() => this.searchInputChanges.next()),
    );

    if (this.readOnly)
      this.ctrl.disable();
  }

  ngOnDestroy() {
    _.each(this.subs, s => s.unsubscribe());
    if (this.valueSub) this.valueSub.unsubscribe();
  }

  setValueAfterDownload() {
    this.ctrl.setValue('');
  }

  ngAfterViewInit() {
    if (this.canClose) this.focusOnSearch();
  }

  validate(c: FormControl) {
    return this.ctrl.errors;
  }

  private get valueSubFactory(): Subscription {
    return this.ctrl.valueChanges
      .pipe(
        tap(() => this.searchFailed = false),
        debounceTime(500),
        map((value: string) => value ? value.trim() : value ),
        distinctUntilChanged(),
        switchMap(this.filterValues.bind(this))
      )
      .subscribe(this.onValueChanges.bind(this));
  }

  private filteredItems(term: string): Observable<MICA.SelectableEl[]> {
    let itemsSearch$: Observable<any> = of([]);
    let itemsStatic$: Observable<MICA.SelectableEl[]> = of([]);
    let testIcdMinLen = false;

    if (this.liveSearchType && !this.initialState) {
      this.searching.next(true);
      this.cd.detectChanges();

      if (term.length < this.typeAheadMin || this.ctrl.invalid) {
        this.searching.next(false);
        this.searchFailed = false;
        itemsSearch$ = of([]);
      }
      const url = _.get(this.state.global.api.search, this.liveSearchType) as string;
      if (!this.searching.value) {
        this.items = [];
        testIcdMinLen = true;
      }
      if (!testIcdMinLen) {
        itemsSearch$ = this.api.search(term, url, this.urlQuery)
          .pipe(
            tap(this.setSearchFailed.bind(this)),
            map(this.withoutExcludedItems.bind(this)),
            map(this.setOrigin.bind(this)),
            map(this.sortItemsByKey.bind(this)),
            catchError(this.handleSearchError.bind(this)),
            finalize(this.onSearchComplete.bind(this))
          );
      }
    }
    if (this.items) {
      const results: MICA.SelectableEl[] = _.chain(this.items)
        .filter(this.checkTerm.bind(this, term))
        .reject(this.isExcluded.bind(this))
        .map(this.setOriginToStatic)
        .take(50)
        .sortBy(this.sortByKey)
        .value();
      itemsStatic$ = this.getItemsStatic(results);
    }
    this.setInitialState();
    return this.getItemsSearch(itemsSearch$, itemsStatic$);
  }

  resultFormatter = (selectable: MICA.SelectableEl): string => {
    if (this.resultKey)
      return selectable[this.resultKey];
    return  selectable.name === selectable.value
      ? selectable.name
      : selectable.value + ': ' + selectable.name;
  };

  get dropdownClass(): {[className: string]: boolean} {
    return {
      small: this.small,
      'has-danger': this.searchFailed,
      'has-warning': this.ctrl.invalid
    }
  }

  focusOnSearch() {
    if (this.searchInput) this.searchInput.nativeElement.focus();
  }

  focusLost() {
    if (!this.canClose) {
      this.close.emit(true);
    }
    this.showDropdown = false;
    this.focusOnSearch();
  }

  clickedOutside () {
    this.showDropdown = false;
  }

  private filterValues(term: string) {
    return term ? this.filteredItems(term) : of([])
  }

  private onValueChanges(items: MICA.SelectableEl[]) {
    if (items.length) {
      this.searchFailed = false;
      this.showDropdown = true;
      this.noSearch.emit(false);
    } else {
      this.noSearch.emit(true);
    }
    this.selectableItems.next(items)
  }

  private onSelectCtrlChange(v: any) {
    this.selectableItems.next([]);
    this.valueSub.unsubscribe();
    this.ctrl.setValue(v);
    this.valueSub = this.valueSubFactory;
    this.propagateChange(v);
  }

  private valueExists = (v: any) => !!v;

  private setSearchFailed(data: SelectableEl[]) {
    this.searchFailed = !data.length;
  }

  private withoutExcludedItems(items: any) {
    const resultItems = this.removeSelectedValues ? _.reject(items, (item: any) => this.isExcluded(item) as any) : items;
    return _.take(resultItems, 50)
  }

  private isExcluded = (item: any) => ~_.indexOf(this.excludeItems, item.value)
    || ~_.indexOf(this.excludeItems, item.name);

  private setOrigin(items: any): Array<any> {
    return _.map(items, i => ({...i, origin: this.liveSearchType}));
  }

  private sortItemsByKey(items: any) {
    return _.sortBy(items, this.sortByKey);
  }

  private handleSearchError(error: any): any {
    this.searchFailed = true;
    return ErrorObservable.create(error);
  }

  private onSearchComplete() {
    this.searching.next(false);
  }

  private checkTerm = (term: string, v: any) => new RegExp(term, 'gi').test(v.name);

  private setOriginToStatic = (i: any) => ({...i, origin: 'static'});

  private getItemsStatic(results: SelectableEl[]) {
    if (results.length === 0) {
      this.searchFailed = true;
      return of([]);
    } else {
      this.searchFailed = false;
      return of(results);
    }
  }

  private setInitialState() {
    if (this.initialState) {
      this.initialState = false;
      this.searchFailed = false;
    }
  }

  private getItemsSearch(itemsSearch: Observable<any>, itemsStatic: Observable<any>) {
    return itemsSearch && itemsStatic
      ? itemsSearch.pipe(flatMap(this.concatItems.bind(this, itemsStatic)))
      : itemsSearch || itemsStatic
  }

  private concatItems(itemsStatic: Observable<any>, items: Array<any>) {
      return itemsStatic.pipe(map(staticItems => [...items, ...staticItems]))
  }

  private optionSelect(value: string) {
    this.selectCrl.setValue(value);
    this.select.emit(value)
  }
}
