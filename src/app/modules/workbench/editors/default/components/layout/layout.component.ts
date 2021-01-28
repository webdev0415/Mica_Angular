import { activeCategoryID, activeCategoryIDNext } from "./../../../../../../state/nav/nav.selectors";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, Inject } from "@angular/core";
import { trigger, state, style, transition, animate } from "@angular/animations";
import { DOCUMENT } from "@angular/common";
import { NgRedux, select } from "@angular-redux/store";
import { PageScrollService, PageScrollInstance } from "ngx-page-scroll";
import { activeSymptomGroupData, catNameFromID } from "../../../../../../state/symptoms/symptoms.selectors";
import { setActiveCategory } from "../../../../../../state/nav/nav.actions";
import * as _ from "lodash";
import {filter, map, pluck, first} from "rxjs/operators";
import {of} from "rxjs/observable/of";
import SymptomGroupBasic = Workbench.Normalized.SymptomGroupBasic;

@Component({
  animations: [
    trigger("fadeIn", [
      state("animated", style({opacity: 1})),
      transition("void => animated", [
        style({opacity: 0}),
        animate("500ms ease-out")
      ])
    ]),
  ],
  selector: "workbench-default",
  templateUrl: "layout.component.html",
  styleUrls: ["./layout.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkbenchDefaultLayoutComponent implements OnInit {
  @select(activeSymptomGroupData) sgData: Observable<Workbench.SymptomGroupBasic>;
  @select(activeCategoryIDNext) activeCategoryIDNext: Observable<string>;
  @select(activeCategoryID) activeCategoryID: Observable<string>;
  dataCorruptMsg = "";
  private animateCategory = false; // whether to animate on first load, only when changing categories
  categories: Observable<string[]> = of([]);
  get nextCategoryName() { return this.activeCategoryIDNext.pipe(map(id => catNameFromID(id || "")(this.state))) }
  get categoryState() { return this.animateCategory ? "animated" : "non-animated" }
  private get state() { return this.s.getState(); }
  private get activeCategoryIDSync() { return activeCategoryID(this.state) }
  private get sgDataSync() { return this.placeCoreSymptomsAtFirstInSymptomGroup(activeSymptomGroupData(this.state) as Workbench.Normalized.SymptomGroupBasic) }

  constructor(private s: NgRedux<State.Root>,
              private scrollSvc: PageScrollService,
              @Inject(DOCUMENT) private document: any,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.categories = this.sgData
      .pipe(
        filter(this.exists),
        first(),
        pluck("categories"),
        map(this.placeCoreSymptomsAtFirst.bind(this))
      );
    // const sgId = this.route.parent.snapshot.url[0].path;
    const groupCategories = this.sgDataSync.categories;
    if (!this.activeCategoryIDSync || !~_.indexOf(groupCategories, this.activeCategoryIDSync)) {
      // TODO: it should be reset to zero also if there's an active cat and no queryParams to scroll to symptom
      this.s.dispatch(setActiveCategory(groupCategories[0]));
    }
  }

  categoryName(id: string): string {
    return catNameFromID(id)(this.state);
  }

  onSelectCategory(categoryID: string, e?: Event, ) {
    // prevent navigation
    if (e) {
      e.preventDefault();
    } else {
      window.scrollTo(0, 0);
    }
    this.animateCategory = true;
    setTimeout(() => {
      this.s.dispatch(setActiveCategory(categoryID));
      const topScroll = PageScrollInstance.newInstance({
        document: this.document,
        scrollTarget: ".default-editor",
        pageScrollDuration: 300,
        pageScrollOffset: 70
      });
      this.scrollSvc.start(topScroll);
    }, 0);
  }

  onSelectNextCategory() {
    const categories = this.sgDataSync.categories;
    const max = categories.length - 1;
    const currentIndex = _.findIndex(categories, c => c === this.activeCategoryIDSync);
    const nextIndex = currentIndex === max ? 0 : currentIndex + 1;
    this.onSelectCategory(categories[nextIndex]);
  }

  private exists = (val: any) => !!val;

  private placeCoreSymptomsAtFirst(categories: Array<string>): Array<string> {
    const placeAtFirst = (arr: Array<string>, currentIndex: number) => {
      arr.unshift(arr.splice(currentIndex, 1)[0]);
      return arr;
    };
    const categoryNames: Array<string> = categories.map((category: string) => this.categoryName(category));
    const coreGroupIndex = categoryNames.findIndex(category => category.toUpperCase().indexOf("CORE") > -1);
    if (coreGroupIndex > -1) {
      return placeAtFirst(categories, coreGroupIndex);
    }
    return categories;
  }

  private placeCoreSymptomsAtFirstInSymptomGroup(symptomGroup: SymptomGroupBasic) {
    if (!symptomGroup) {
      return {
        categories: []
      };
    }
    const categories = symptomGroup.categories;
    symptomGroup.categories = this.placeCoreSymptomsAtFirst(categories);
    return symptomGroup;
  }

}
