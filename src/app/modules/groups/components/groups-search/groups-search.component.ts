import { findGroupsLive } from "app/state/groups/groups.selectors";
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  HostListener,
  SimpleChanges,
  OnChanges
} from "@angular/core";
import {
  FormControl,
  Validators
} from "@angular/forms";
import { NgRedux } from "@angular-redux/store";
import { BehaviorSubject, Subscription } from "rxjs";
import * as _ from "lodash";
import { debounceTime, finalize, take } from "rxjs/operators";
import { GroupService } from "app/services/group.service";

@Component({
  selector: "mica-groups-search",
  templateUrl: "./groups-search.component.html",
  styleUrls: ["./groups-search.component.sass"]
})
export class GroupsSearchComponent implements OnInit, OnChanges, OnDestroy {
  @Input() size: "" | "large" = "";
  @Input() selector = false;
  @Input() searchQuery: string | null;
  @Input() minSearchQueryLength = 3;
  @Input() showingResults: boolean;

  @Output() record: EventEmitter<Groups.SymptomsInGroup> = new EventEmitter;
  @Output() searchQueryChanges: EventEmitter<string> = new EventEmitter();
  @Output() searchResultsExistenceChanges: EventEmitter<boolean> = new EventEmitter();

  @ViewChild("input", {static: false}) inputRef: ElementRef;
  @ViewChild("ul", {static: false}) ulRef: ElementRef;

  searchCtrl = new FormControl("", [Validators.required, Validators.pattern("^[_A-z0-9]*((-|\\s)*[_A-z0-9])*$")]);
  searching = false;
  noRecordFound = false;
  hasBackendError = false;
  searchResults: BehaviorSubject<MICA.SelectableEl[]> = new BehaviorSubject([]);
  searchTryGroup = false;
  focusOnSearch = false;
  searchSub: Subscription;

  private subs: Subscription[] = [];
  private get state() { return this.s.getState(); }

  constructor(private s: NgRedux<State.Root>,
              private cd: ChangeDetectorRef,
              private groupService: GroupService) { }

  ngOnInit() {
    this.searchSub = this.getSearchSub();
    this.subs.push(this.searchSub);
    this.groupService.searchBarClearListener().subscribe(clearStatus => {
      if (clearStatus) this.clearInput();
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    const { searchQuery } = changes;
    if (searchQuery && searchQuery.currentValue !== null && searchQuery.currentValue !== undefined) {
      this.searchCtrl.setValue(searchQuery.currentValue);
    }
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

  private getSearchSub() {
    return this.searchCtrl.valueChanges
      .pipe(
        debounceTime(100)
      )
      .subscribe(this.onSearchCtrlChange.bind(this));
  }

  onClose() {
    this.searchCtrl.setValue("");
    this.searchTryGroup = false;
    const input = this.inputRef.nativeElement;
    input.focus();
    this.focusOnSearch = true;
  }

  onSearchByIcon() {
    if (this.searchResults.value.length === 1) {
      this.onSearch(this.searchResults.value[0].value);
    } else if (this.searchCtrl.value && this.searchCtrl.value.length >= this.minSearchQueryLength) {
      this.searchCtrl.setValue(this.searchCtrl.value);
    }
  }

  onSearch(searchValue: number) {
    this.focusOnSearch = false;
    this.noRecordFound = false;
    this.hasBackendError = false;
    this.searchResultsExistenceChanges.next(true);
    // check whether search term matches any items in the dropdown
    // set valueTrimmed to "" if not match, in order to prevent search

    if (searchValue) {
      const searchResults = this.searchResults.value;
      const matchedResult: any = searchResults.find(result => result.value === searchValue);
      searchValue = matchedResult ? matchedResult.value : 0;
      this.searching = true;
      this.searchTryGroup = false;
      if (searchValue === 0) {
        this.noRecordFound = true;
        this.searching = false;
        return;
      }
      this.groupService.getSymptomsInGroup(searchValue)
        .pipe(
          take(1),
          finalize(() => {
            this.searching = false;
            this.searchSub.unsubscribe();
            this.searchCtrl.setValue(matchedResult.name);
            this.searchSub = this.getSearchSub();
            this.cd.markForCheck();
          })
        )
        .subscribe(
          (record) => {
            this.searchCtrl.setValue("");
            this.record.emit(record);
          },
          (error: MICA.BasicError) => {
            if (error.status === 404) {
              this.noRecordFound = true;
            } else {
              this.hasBackendError = true;
              console.warn(error);
            }
          }
        )
      }
    }

    clearInput() {
      this.searchCtrl.reset();
    }

  private onSearchCtrlChange(term: string) {
    if (!term) return;
    term = term.toUpperCase();
    this.focusOnSearch = true;
    this.searchResultsExistenceChanges.next(false);
    this.searchQueryChanges.next(term);

    if (term.length < this.minSearchQueryLength) {
      this.onSearch(0);
      this.searchResults.next([]);
    } else {
      const foundGroups = _.map(findGroupsLive(term)(this.state), s => {
        return { name: s.name, value: s.groupID };
      });

      this.searchResultsExistenceChanges.next( !!_.filter(foundGroups, item => item.name.toUpperCase() === term.trim()).length);
      this.setSearchResults(false, foundGroups);
    }
  }

  private setSearchResults(errorThrown: boolean, foundGroups: Array<any>) {
    if (errorThrown) {
      foundGroups = [];
    }
    const nextValues = foundGroups;
    if (!nextValues.length) {
      // no group found in live search
      this.searchTryGroup = true;
      this.searchResults.next([]);
    } else {
      // show group results
      this.noRecordFound = false;
      this.hasBackendError = false;
      this.searchTryGroup = false;
      this.searchResults.next(nextValues);
    }
  }
}
