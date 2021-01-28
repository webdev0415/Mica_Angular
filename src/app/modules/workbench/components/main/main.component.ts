import { SymptomService } from "app/services";
import { setIllnessError, upsertIllness } from "app/state/workbench/workbench.actions";
import { setActiveCategory, ACTIVE_SECTION_SET, TOGGLE_ILLNESS_ERRORS } from "app/state/nav/nav.actions";
import { activeSectionID, activeCategoryID } from "app/state/nav/nav.selectors";
import { Router, ActivatedRoute, NavigationEnd, Params } from "@angular/router";
import { DOCUMENT } from "@angular/common";
import { TitleService } from "../../../global-providers/services/title.service";
import { FormGroup } from "@angular/forms";
import { Observable, Subscription, BehaviorSubject, throwError } from "rxjs";
import { Component, Inject, OnDestroy, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { NgRedux, select } from "@angular-redux/store";
import { PageScrollService, PageScrollInstance } from "ngx-page-scroll";
import { activeIllnessValue } from "app/state/workbench/workbench.selectors";
import { activeSymptomGroupData, symptomDataPath } from "app/state/symptoms/symptoms.selectors";
import * as _ from "lodash";
import { formGroupFactory } from "app/util/forms/create";
import { illnessErrorTracker, validateIllnessValue } from "app/util/forms/validators";
import { catchError, distinctUntilChanged, filter, map, switchMapTo, take, tap } from "rxjs/operators";
import { denormalizeIllnessValue } from "app/state/denormalized.model";
import IllnessValue = Illness.Normalized.IllnessValue;
import { ValidationService } from "../../../validation/validation.service";

@Component({
  selector: "mica-workbench",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkbenchMainComponent implements OnInit, OnDestroy {
  @select(activeIllnessValue) activeIllnessValue: Observable<Illness.Normalized.IllnessValue>;
  @select(activeSymptomGroupData) symptomGroupData: Observable<Workbench.Normalized.SymptomGroup>;
  @select(["nav", "showIllnessErrors"]) showIllnessErrors: Observable<boolean>;

  private illRootForm: FormGroup; // form of illness properties (not symptoms)
  private illRootFormSub: Subscription;
  private subs: Subscription[] = [];
  private viewReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private illnessErrorsAreShowing: boolean;

  private get state() {
    return this.s.getState();
  }

  constructor(private s: NgRedux<State.Root>,
              private title: TitleService,
              private pageScrollService: PageScrollService,
              public router: Router,
              private route: ActivatedRoute,
              private symptomSvc: SymptomService,
              private validation: ValidationService,
              @Inject(DOCUMENT) private document: any) {
    // See https://github.com/angular/angular/issues/17473
    this.subs.push(
      this.router.events.pipe(
        filter(this.isNavigationEnd),
        tap(this.processNavigationEnd.bind(this)),
        switchMapTo(this.viewReady),
        filter(this.exists)
      ).subscribe(this.onNavigationEnd.bind(this))
    );
  }

  ngOnInit() {
    this.subs.push(
      this.activeIllnessValue.pipe(
        filter(this.exists),
        distinctUntilChanged(this.hasSameCode),
        catchError(this.onError)
      ).subscribe(
        this.onActiveIllnessValue.bind(this),
      ),

      this.activeIllnessValue.pipe(
        filter(this.exists),
        distinctUntilChanged(this.hasEqualGroups),
      ).subscribe(this.handleActiveIllnessValue.bind(this)),

      this.showIllnessErrors.subscribe(this.onShowIllnessErrors.bind(this))
    );
  }

  toggleErrors() {
    this.s.dispatch({type: TOGGLE_ILLNESS_ERRORS})
  }

  ngOnDestroy() {
    _.each(this.subs, s => s.unsubscribe());
    if (this.illRootFormSub) this.illRootFormSub.unsubscribe();
    if (this.illnessErrorsAreShowing) this.toggleErrors()
  }

  private processNavigationEnd() {
    const { symptomID } = this.queryParams;

    this.symptomSvc.lazyCheckDefinitions().pipe(
      take(1)
    ).subscribe(() => {
      this.viewReady.next(true);
    });

    this.symptomSvc.lazyCheckWorkbenchDataVersion().pipe(
      take(1),
      catchError(this.onCheckDataVersionError)
    ).subscribe(() => {});

    if (symptomID) {
      // Prepare scrolling to symptom by changing category
      const loc: Symptom.LocationData = symptomDataPath(symptomID)(this.state);

      if (loc.categoryID !== activeCategoryID(this.state)) {
        this.s.dispatch(setActiveCategory(loc.categoryID));
      }
      // Same for section
      if (loc.sectionID !== activeSectionID(this.state)) {
        if (loc.sectionID) {
          this.s.dispatch({
            type: ACTIVE_SECTION_SET,
            section: loc.sectionID
          });
        }
      }
    }
  }

  private onNavigationEnd() {
    const { symptomID } = this.queryParams;

    if (!symptomID) {
      // there is no scrolling to a symptom
      this.pageScrollService.start(PageScrollInstance.newInstance({
        document: this.document,
        scrollTarget: "#header",
        pageScrollDuration: 500,
      }));
    } else {
      this.pageScrollService.start(PageScrollInstance.newInstance({
        document: this.document,
        scrollTarget: `#${symptomID}`,
        pageScrollDuration: 500,
        pageScrollOffset: 20
      }));
    }
  }

  private get queryParams(): Params {
    return this.route.snapshot.queryParams;
  }

  private onActiveIllnessValue(v: Illness.Normalized.IllnessValue) {
    this.title.pageTitle = [v.form.idIcd10Code];
    this.illRootForm = formGroupFactory(_.omit(v.form, "symptomGroups"), this.state) as FormGroup;

    if (this.illRootFormSub) {
      this.illRootFormSub.unsubscribe();
    }

    this.illRootFormSub = this.illRootForm.statusChanges
      .pipe(
        distinctUntilChanged(),
        map(this.trackIllnessError.bind(this))
      )
      .subscribe(this.onRootIllFormError.bind(this))
  }

  private handleActiveIllnessValue(illnessValue: IllnessValue) {
    const groupsCompleteCtrl = this.illRootForm.get("groupsComplete");
    const groupsComplete = illnessValue.form.groupsComplete;

    if (groupsCompleteCtrl) {
      groupsCompleteCtrl.setValue(groupsComplete);
    } else {
      console.error("Groups complete control is missing.")
    }

    try {
      validateIllnessValue(illnessValue, this.state);
    } catch (error) {
      const illness = denormalizeIllnessValue(this.validation.sanitizeIllness(illnessValue));

      this.s.dispatch(upsertIllness(illness));
    }
  }

  private exists = (val: any) => !!val;
  private isNavigationEnd = (ev: any) => ev instanceof NavigationEnd;
  private hasEqualGroups = (x: Illness.Normalized.IllnessValue, y: Illness.Normalized.IllnessValue) => x.form.groupsComplete.length === y.form.groupsComplete.length;
  private hasSameCode = (x: Illness.Normalized.IllnessValue, y: Illness.Normalized.IllnessValue) => x.form.idIcd10Code === y.form.idIcd10Code;
  private onError(err: any) {
    console.error("Unable to set title for active illness: ", err);
    return throwError(err);
  }

  private onShowIllnessErrors(val: boolean) {
    this.illnessErrorsAreShowing = val;
  }

  private onCheckDataVersionError(err: any) {
    console.error("Unable to check new workbench model version: ", err);
    return throwError(err);
  }

  private trackIllnessError() {
    return illnessErrorTracker(this.illRootForm);
  }

  private onRootIllFormError(error: Task.IllnessRootError) {
    this.s.dispatch(setIllnessError(error));
  }
}
