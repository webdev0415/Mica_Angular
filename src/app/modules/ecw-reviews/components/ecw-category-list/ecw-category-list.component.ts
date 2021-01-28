import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
} from "@angular/core";
import { NgRedux } from "@angular-redux/store";
import { catNameFromID, sectionNameFromID } from "../../../../state/symptoms/symptoms.selectors";
import { categoriesFromActiveIllness } from "./../../../../state/ecw/ecw.selectors";

@Component({
  selector: "ecw-category-list",
  templateUrl: "./ecw-category-list.component.html",
  styleUrls: ["./ecw-category-list.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class EcwCategoryListComponent implements OnInit, OnDestroy {
  @Input() sectionID: string;
  @Input() categoryIDs: string[];
  private get state() {return this.s.getState()}

  constructor(private cd: ChangeDetectorRef,
              private s: NgRedux<State.Root>) { }
                                                 
  ngOnInit() {

  }

  getSymptoms(categoryID: string) {
    const categoryValue = categoriesFromActiveIllness(this.state)[categoryID];
    return categoryValue.symptoms;
  }

  get sectionName() {
    return this.sectionID ? sectionNameFromID(this.sectionID)(this.state) : ""
  }

  getCatName(categoryID: string): string {
    return catNameFromID(categoryID)(this.state);
  }

  trackByFn(index: number, value: Illness.FormValueCategory) {
    return value.categoryID;
  }

  ngOnDestroy() {

  }
}
