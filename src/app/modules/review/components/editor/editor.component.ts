import * as _ from "lodash";
import { isReviewer } from "app/state/user/user.selectors";
import { TitleService } from "../../../global-providers/services/title.service";
import { Observable } from "rxjs";
import { SymptomService } from "app/services/symptom.service";
import { NgRedux, select } from "@angular-redux/store";
import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { activeIllnessValue } from "app/state/workbench/workbench.selectors";
import { validateIllnessValue } from "app/util/forms/validators";
import { ValidationService } from "../../../validation/validation.service";
import { upsertIllness } from "app/state/workbench/workbench.actions";
import { denormalizeIllnessValue } from "app/state/denormalized.model";
import { of } from "rxjs/observable/of";
import { catchError, distinctUntilChanged, filter, first, map } from "rxjs/operators";
import { setActiveGroup } from "app/state/nav/nav.actions";

@Component({
  selector: "review-editor",
  templateUrl: "./editor.component.html",
  styleUrls: ["./editor.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewEditorComponent implements OnInit {
  @select(activeIllnessValue) activeIllnessValue: Observable<Illness.Normalized.IllnessValue>;
  dataCorruptMsg: Observable<string>;
  dataLoading: Observable<boolean> = this.sympSvc.rehydrateSymptomGroups().pipe(map(r => false));
  isReviewer = isReviewer(this.state);

  private get state() {
    return this.s.getState()
  }

  constructor(private s: NgRedux<State.Root>,
              private sympSvc: SymptomService,
              private titleSvc: TitleService,
              private validate: ValidationService) {
  }

  ngOnInit() {
    this.dataLoading
      .pipe(
        first()
      )
      .subscribe(this.onDataLoaded.bind(this));

    this.dataCorruptMsg = this
      .activeIllnessValue
      .pipe(
        filter(this.exists),
        distinctUntilChanged((prev, next) => _.isEqual(prev, next)),
        map(this.handleIllness.bind(this)),
        catchError(this.handleError)
      );
    // reset active Symptom Group
    this.s.dispatch(setActiveGroup(""));
  }

  private handleError(error: Error): Observable<any> {
    console.error("Corrupted data detected");
    console.log("Error: ", error);
    return of(error.message);
  }

  private handleIllness(value: Illness.Normalized.IllnessValue) {
    try {
      validateIllnessValue(value, this.state);
    } catch (error) {
      const illness = denormalizeIllnessValue(this.validate.sanitizeIllness(value));

      this.s.dispatch(upsertIllness(illness));
    }
  }

  private exists = (val: any) => !!val;

  private onDataLoaded(r: any) {
    const value = activeIllnessValue(this.state);

    if (!value) {
      throw Error("There is no active illness after loading data");
    }

    this.titleSvc.pageTitle = [value.form.idIcd10Code];
  }
}
