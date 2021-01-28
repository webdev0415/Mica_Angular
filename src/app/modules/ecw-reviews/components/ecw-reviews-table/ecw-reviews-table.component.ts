// import { NgRedux } from "@angular-redux/store";
import {
  Component, OnInit, OnChanges, ChangeDetectionStrategy,
  Input, Output, EventEmitter
} from "@angular/core";

@Component({
  selector: "ecw-reviews-table",
  templateUrl: "./ecw-reviews-table.component.html",
  styleUrls: ["./ecw-reviews-table.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EcwReviewsTableComponent implements OnInit, OnChanges {
  @Input() illnesses: ECW.Illness[];
  @Input() filter: ECW.AnyState | undefined;
  @Output() onChangeFilter = new EventEmitter<ECW.AnyState>();
  @Output() onSelectIllness = new EventEmitter<ECW.Illness>();
  filters: ECW.AnyState[] = ["ALL", "LOADED", "FINAL", "REVIEWED"];
  currentFilter: ECW.AnyState;

  constructor() {
  }

  ngOnInit() {
  }

  ngOnChanges() {
    this.currentFilter = this.filter ? this.filter : this.filters[0];
  }

  setFilter(filter: ECW.AnyState) {
    if (this.currentFilter === filter) {
      return;
    }
    this.onChangeFilter.emit(filter);
  }

  trackByFn(index: number, row: any) {
    return index;
  }

  get filteredIllnesses(): ECW.Illness[] {
    if (!this.currentFilter || this.currentFilter === this.filters[0]) {
      return this.illnesses;
    }
    return this.illnesses.filter(el => el.status === this.currentFilter);
  }

  onSelect(illness: ECW.Illness) {
    this.onSelectIllness.emit(illness);
  }

}
