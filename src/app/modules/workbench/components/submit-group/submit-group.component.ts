import { IllnessService, AuthService,  } from "app/services";
import { WorkbenchService } from "../../services/workbench.service";
import { upsertIllness } from "app/state/workbench/workbench.actions";
import { ValidationService } from "../../../validation/validation.service";
import {
  activeIllnessValue, isSymptomGroupActiveComplete,
  isActiveSymptomGroupValid
} from "app/state/workbench/workbench.selectors";
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import { NgRedux, select } from "@angular-redux/store";
import { Observable } from "rxjs";
import { activeSymptomGroup } from "app/state/nav/nav.selectors";
import { postMsg } from "app/state/messages/messages.actions";
import { completeSymptomGroup } from "app/state/workbench/workbench.actions";
import { denormalizeIllnessValue } from "app/state/denormalized.model";
import { Router } from "@angular/router";
import { finalize, map } from "rxjs/operators";

@Component({
  selector: "workbench-submit-group",
  templateUrl: "./submit-group.component.html",
  styleUrls: ["./submit-group.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubmitGroupComponent implements OnInit {
  @select(activeSymptomGroup) symptomGroup: Observable<String>;
  @select(isSymptomGroupActiveComplete) isComplete: Observable<boolean>;
  @select(isActiveSymptomGroupValid) isSymptomGroupValid: Observable<boolean>;
  syncingIllness = false;
  btnType: Observable<string>;

  private get state() {
    return this.s.getState()
  }

  constructor(private workbenchSvc: WorkbenchService,
              private illnessSvc: IllnessService,
              private s: NgRedux<State.Root>,
              private validate: ValidationService,
              private cd: ChangeDetectorRef,
              private auth: AuthService,
              private router: Router) {
  }

  ngOnInit() {
    this.btnType = this.isComplete.pipe(map(c => c ? "locked" : "submit"));
  }

  onSGComplete(): void {
    this.auth.isAuthenticated$.subscribe(val => {
      if (!val) {
        this.router.navigate(["logout"]);
        this.auth.showWidget();
        return;
      }
      this.syncingIllness = true;
      const SGName = activeSymptomGroup(this.state);
      let illness = activeIllnessValue(this.state);
      if (!illness) {
        this.s.dispatch(postMsg(
          "Unable to determine active illness to sync.",
          {type: "error"}
        ));
        return;
      }
        this.s.dispatch(completeSymptomGroup(
          SGName,
          true
        ));
        illness = activeIllnessValue(this.state);
        // add a row for each grouped multiplier value
        this.syncIllData(illness as Illness.Normalized.IllnessValue, SGName);
    }).unsubscribe();
  }

  private syncIllData(illness: Illness.Normalized.IllnessValue, SGName: string) {
    if (!illness) throw Error("unable to get illness with complete Symptom Group");

    const safeValue = denormalizeIllnessValue(this.validate.sanitizeIllness(illness));

    this.illnessSvc.syncIllnessData(safeValue)
      .pipe(
        finalize(() => {
          this.syncingIllness = false;
          this.cd.detectChanges();
        })
      )
      .subscribe(() => {
        const SGNameCase = SGName === "nlp" ? SGName.toUpperCase() : SGName.charAt(0).toUpperCase() + SGName.substr(1).toLowerCase();

        this.s.dispatch(postMsg(
          `${SGNameCase}
            completed & ${safeValue.idIcd10Code} synced successfully`,
          { type: "success" }
        ));
        this.s.dispatch(upsertIllness(safeValue)); // save with purges
        this.workbenchSvc.goToNextSymptomGroup();
        }
      );
  }

}
