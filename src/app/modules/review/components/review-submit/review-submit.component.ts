import { UniquenessModalComponent } from "../uniqueness-modal/uniqueness-modal.component";
import { UniquenessService } from "../../services/uniqueness.service";
import { ValidationService } from "../../../validation/validation.service";
import { Router } from "@angular/router";
import { deleteIllness, setIllnessError } from "app/state/workbench/workbench.actions";
import {
  activeIllnessValue,
  isActiveIllnessValid,
  symptomGroupsCompleteValue,
  isActiveIllnessHasSymptoms,
  activeSymptomGroupHasAnySymptoms, areSymptomGroupsValid,
} from "app/state/workbench/workbench.selectors";
import { IllnessService } from "app/services/illness.service";
import { postMsg } from "app/state/messages/messages.actions";
import {
  Component, Input, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef, TemplateRef
} from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { NgRedux, select } from "@angular-redux/store";
import {Subscription, Observable, throwError} from "rxjs";
import { isReviewer } from "app/state/user/user.selectors";
import { illnessErrorTracker } from "app/util/forms/validators/illness";
import { formGroupFactory } from "app/util/forms/create";
import * as _ from "lodash";
import { denormalizeIllnessValue } from "app/state/denormalized.model";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { catchError, distinctUntilChanged, finalize, map, switchMapTo, take } from "rxjs/operators";

@Component({
  selector: "review-submit",
  templateUrl: "./review-submit.component.html",
  styleUrls: ["./review-submit.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ReviewSubmitComponent implements OnInit, OnDestroy {
  @Input() syncingIllness = false;
  @Input() isUnique = false;
  @Input() initial = false;

  @select(activeIllnessValue) illnessValue: Observable<Illness.Normalized.IllnessValue>;
  @select(isActiveIllnessValid) isActiveIllnessValid: Observable<boolean>;
  @select(activeSymptomGroupHasAnySymptoms) activeSymptomGroupHasAnySymptoms: Observable<boolean>;
  @select(symptomGroupsCompleteValue) symptomGroupsCompleteValue: Observable<string[]>;
  @select(isActiveIllnessHasSymptoms) isActiveIllnessHasSymptoms: Observable<boolean>;
  @select(areSymptomGroupsValid) areSymptomsValid: Observable<boolean>;
  isReviewer = isReviewer(this.state);
  illForm: FormGroup;
  formSub: Subscription;
  criticalityCtrl = new FormControl("", Validators.required);
  includeTime = false;
  warningReason = {
    noSymptoms: {
      description: "This illness does not contain any symptoms.",
      suggestion: "Please add at least one symptom."
    },
    notUnique: {
      description: "This illness is not unique.",
      suggestion: "Only unique illnesses can be approved or rejected."
    }
  };

  private rejectionReasonCtrlName = "rejectionReason";
  private subs: Subscription[] = [];

  get rejectionCtrl(): FormControl {
    return this.illForm.get(["form", this.rejectionReasonCtrlName]) as FormControl
  }

  private get state() {
    return this.s.getState()
  }

  constructor(private s: NgRedux<State.Root>,
              private illSvc: IllnessService,
              private uniqSvc: UniquenessService,
              private modal: NgbModal,
              private router: Router,
              private illnessService: IllnessService,
              private validate: ValidationService,
              private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.subs.push(this.symptomGroupsCompleteValue.subscribe(groups => {
      this.updateAndValidityIllnessForm();
    }));
    this.subs.push(this.illnessValue.subscribe(this.updateAndValidityIllnessForm.bind(this)))
  }

  updateAndValidityIllnessForm() {
    const value = activeIllnessValue(this.state);

    if (!value) {
      return;
    }

    const illForm = formGroupFactory(value, this.state) as FormGroup;
    const form = illForm.get("form") as FormGroup;

    if (form && form.get(this.rejectionReasonCtrlName)) {
      form.removeControl(this.rejectionReasonCtrlName);
    }

    this.illForm = illForm;

    if (this.formSub) {
      this.formSub.unsubscribe();
    }

    this.formSub = this.illForm.statusChanges
      .pipe(
        distinctUntilChanged(),
        map(this.checkIllForm.bind(this))
      )
      .subscribe((error: any) => {
        this.s.dispatch(setIllnessError(error));
      });
    this.illForm.updateValueAndValidity();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    if (this.formSub) {
      this.formSub.unsubscribe();
    }
  }

  private onCheckUniqueness() {
    const value = activeIllnessValue(this.state);

    if (!value) return;

    this.syncingIllness = true;
    this.checkUniqueness(value, this.includeTime)
      .pipe(
        take(1),
        finalize(() => {
          this.syncingIllness = false;
          this.initial = false;
          this.cd.detectChanges();
        })
      )
      .subscribe(res => {
        this.isUnique = res && !(res as any).length;

        if (!this.initial) {
          const modalRef = this.modal.open(UniquenessModalComponent, { size: "lg" });
          this.handleModal(res, modalRef);
        }
      });
  }

  onSubmitCriticality(content: TemplateRef<any>) {
    this.modal.open(content).result
      .then((illStateMICA: Illness.State) => {
          if (!this.criticalityCtrl.value) {
            console.error("Criticality is needed to approve illness");
          } else {
            this.onSubmitIllness(illStateMICA, this.criticalityCtrl.value);
          }
        },
        (reason) => {
          if (reason !== "cancel") console.error("Error in modal: ", reason)
        },
      );
  }

  onSubmitIllness(illStateMICA: Illness.State, criticality?: number) {
    /* istanbul ignore next */
    const rejectionReasonCtrl = this.illForm ? this.illForm.get(["form", "rejectionReason"]) : undefined;
    const rejectionReason = rejectionReasonCtrl ? rejectionReasonCtrl.value : "";
    const illValue: Illness.FormValue = _.assign(
      denormalizeIllnessValue(this.validate.sanitizeIllness(this.illForm.value)),
      { state: illStateMICA }
    );

    if (criticality) illValue.criticality = criticality;
    if (rejectionReason) illValue.rejectionReason = rejectionReason;
    this.syncingIllness = true;
    this.syncIllData(illValue);
  }


  onAboutToReject() {
    const form = this.illForm ? this.illForm.get("form") as FormGroup : undefined;

    if (!form) {
      throw Error("An illness form is required in ReviewSubmitComponent");
    } else {
      if (this.rejectionCtrl) {
        form.removeControl(this.rejectionReasonCtrlName);
      } else {
        form.addControl(this.rejectionReasonCtrlName, new FormControl(""));
      }
    }
  }

  private syncIllData(illValue: Illness.FormValue) {
    this.illSvc.syncIllnessData(illValue)
      .pipe(
        take(1),
        finalize(() => {
          this.syncingIllness = false;
          this.cd.detectChanges();
        }),
        catchError(error => {
          const errorText = error.status && error.message ? error.status + " " + error.message : JSON.stringify(error);

          this.s.dispatch(postMsg(
            `Unable to submit illness. Please contact support and quote: 'MICA service error: ${errorText}`,
            { type: "error" }
          ));

          return throwError(error);
        })
      )
      .subscribe(data => {
        this.s.dispatch(deleteIllness(illValue.idIcd10Code, illValue.version));
        this.router.navigate(["/"]);
        this.s.dispatch(postMsg(
          data.icd10CodesStatus[0] + " submitted successfully",
          { type: "success" }
        ));
      });
  }

  private handleModal(res: any, modalRef: any) {
    const idIcd10CodeCtrl = this.illForm.get("form.idIcd10Code");
    const nameCtrl = this.illForm.get("form.name");
    const illnesses = res;

    modalRef.componentInstance.idIcd10Code = idIcd10CodeCtrl ? idIcd10CodeCtrl.value : "";
    modalRef.componentInstance.name = nameCtrl ? nameCtrl.value : "";
    modalRef.componentInstance.illnesses = _.sortBy(illnesses);
  }

  private checkIllForm() {
    const rootCtrl = this.illForm.get("form") as FormGroup;
    if (!rootCtrl) throw new Error("There is no root form group");
    return illnessErrorTracker(rootCtrl);
  }

  private checkUniqueness(illnessValue: Illness.Normalized.IllnessValue, includeTime: boolean) {
    const { idIcd10Code, version } = illnessValue.form;
    const denormalizedIllnessValue = denormalizeIllnessValue(illnessValue);

    return this.illnessService.syncIllnessData(denormalizedIllnessValue).pipe(
      switchMapTo(this.uniqSvc.checkUniqueness(idIcd10Code, version, includeTime)),
      take(1),
    );
  }
}
