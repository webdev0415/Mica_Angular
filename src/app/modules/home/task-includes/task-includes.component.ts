import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectionStrategy,
  OnChanges,
  Input,
  SimpleChanges,
  Output,
  EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import { ModalComponent } from "../../gui-widgets/components/modal/modal.component";
import { normalizeIllness } from "app/state/denormalized.model";
import * as _ from "lodash";
import { Observable, Subscription } from "rxjs";
import { combineLatest } from "rxjs/observable/combineLatest";
import { map } from "rxjs/operators";
import { Observer } from "rxjs/Observer";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NgRedux, select } from "@angular-redux/store";
// Redux
import { POST_MSG } from "app/state/messages/messages.actions";
import { setEcwValidationIllness } from "app/state/ecw/ecw.actions";
import { setActiveIllness, upsertIllness } from "app/state/workbench/workbench.actions";
import { activeIllnessValue, illnessValue } from "app/state/workbench/workbench.selectors";
import { entities } from "app/state/symptoms/symptoms.selectors";
import { isReviewer } from "app/state/user/user.selectors";
// Services
import { EcwService } from "app/services/ecw.service";
import { SourceService } from "app/services/source.service";
import { HomeService } from "../home.service";
import { ValidationService } from "app/modules/validation/validation.service";
import { SymptomService } from "app/services";
import { resetNlpSymptoms } from "app/state/symptoms/symptoms.actions";


interface GroupedIllnesses {
  [chapter: string]: Illness.Data[];
}

@Component({
  selector: "mica-task-includes",
  templateUrl: "./task-includes.component.html",
  styleUrls: ["./task-includes.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskIncludesComponent implements OnInit, OnDestroy, OnChanges {
  @select(activeIllnessValue) activeIllnessValue: Observable<Illness.Normalized.IllnessValue>;
  @Input() readonly task: Task.Data;
  @Output() skipIllness: EventEmitter<[Illness.Data, Event]> = new EventEmitter();
  @Output() reviewerIllnessMissing: EventEmitter<Illness.Data[]> = new EventEmitter();
  @Input() syncedIllnesses: null | MICA.User.IllnessesByState;
  @Input() removeEnabled = true;
  currentCode: string;
  currentVersion: number;
  isReviewer = isReviewer(this.state);
  private subs: Subscription[] = [];
  trackByFn(index: number): number { return index }

  constructor(private s: NgRedux<State.Root>,
              private modalService: NgbModal,
              private router: Router,
              private homeService: HomeService,
              private symptomService: SymptomService,
              private sourceService: SourceService,
              private ecwService: EcwService,
              private validation: ValidationService
  ) { }

  get state() {return this.s.getState(); }

  ngOnInit() {
    const currentIllnessSub = this.activeIllnessValue.subscribe(ill => {
      this.currentCode = ill ? ill.form.idIcd10Code : "";
      this.currentVersion = ill ? ill.form.version : 1;
    });
    this.subs.push(currentIllnessSub);
  }

  /* istanbul ignore next */
  ngOnChanges(changes: SimpleChanges) {
    const syncedIllnessesChange = changes.syncedIllnesses;

    if (this.isReviewer && syncedIllnessesChange && syncedIllnessesChange.currentValue) {
      const { previousValue, currentValue } = syncedIllnessesChange;
      const illnessesChanged = !previousValue || previousValue.toString() !== currentValue.toString();
      // Reassign reviewer illnesses
      const state = this.s.getState();
      const illStatesNames = state.global.illStates;
      const illWithoutData: Illness.Data[] = _.reject(this.task.illness, illness => {
        if (!this.syncedIllnesses) return false;

        const illData = _.find(
          this.syncedIllnesses[state.global.illStates.readyForReview],
          { idIcd10Code: illness.idIcd10Code, version: illness.version },
        );

        return illData && illData.state === illStatesNames.readyForReview;
      }) as Illness.Data[];

      if (illWithoutData.length && illnessesChanged) this.reviewerIllnessMissing.emit(illWithoutData);
    }
  }

  private onSkipIllness(illness: Illness.Data, event: Event) {
    const modalRef = this.modalService.open(ModalComponent, { size: "lg" });

    modalRef.componentInstance.data = {
      title: "Are you sure?",
      body: `This action can't be undone. Once you remove this illness it won't be available any more.`,
      actionTxt: `Yes, skip ${illness.idIcd10Code} v${illness.version}`,
      actionName: "skip",
      cancelTxt: `Do not remove ${illness.idIcd10Code} v${illness.version}`
    };

    modalRef.result
      .then(() => {
        this.skipIllness.emit([illness, event]);
      })
      .catch(this.onModalRefResultError);
  }

  private onRevertData(idIcd10Code: string, version: number) {
    const modalRef = this.modalService.open(ModalComponent, {size: "lg"});
    modalRef.componentInstance.data = {
      title: "Are you sure?",
      body: `Reverting data is a destructive action. If you have already completed some data for ${idIcd10Code} v${version}, it will be lost!`,
      actionTxt: `Yes, revert data for ${idIcd10Code} v${version}`,
      actionName: "revert",
      cancelTxt: `Do not revert data`
    };

    modalRef.result
      .then(() => {
        const restoreValue = _.find(this.workableIllnesses, {idIcd10Code, version});
        if (!restoreValue) throw Error("Unable to determine what to revert to.");

        // Handle following edge case:
        //  Detect if user synced an illness without all the symptom groups,
        //  in which case the server will return an empty list of categories
        restoreValue.symptomGroups = this.getSymptomGroups(restoreValue) as any;

        this.s.dispatch(upsertIllness(restoreValue));

        this.dispatchPostMsg(restoreValue, idIcd10Code, version);
      })
      .catch(this.onModalRefResultError);
  }

  /* istanbul ignore next */
  private onEdit(idIcd10Code: string, name: string, version: number) {
    const upsertIllnessSource = new Observable(this.handleUpsertObservable.bind(this, idIcd10Code, version));

    // Reset nlp cache
    this.s.dispatch(resetNlpSymptoms());

    combineLatest([
      upsertIllnessSource,
      this.ecwService.getIllnessByIcd10Code(idIcd10Code, "ECW").pipe(map(data => data[0])),
      this.ecwService.getIllnessByIcd10Code(idIcd10Code, "NLP").pipe(map(this.getNlpIllness)),
      this.symptomService.fetchNlpSymptoms(1)
    ])
      .subscribe(this.setActiveIllness.bind(this, name, idIcd10Code, version));
  }

  private getNlpIllness(data: any) {
    return data && data.length > 0 ? data[0] : null;
  }

  get chapters() {
    return _.keys(this.groupedIllnesses);
  }

  get groupedIllnesses(): GroupedIllnesses {
    return _.chain(this.task.illness)
      .reject((ill: Illness.Data) => !!_.find(this.nonWorkableIllnesses, {"idIcd10Code": ill.idIcd10Code}))
      .sortBy("idIcd10Code")
      .groupBy("chapterDescription")
      .value();
  }

  get allIllnessesComplete(): boolean {
    return this.chapters.length === 0
      && this.nonWorkableIllnesses.length === 0;
  }

  private isActiveIllness(idIcd10Code: string, version: number): boolean {
    return this.currentCode === idIcd10Code && this.currentVersion === version;
  }

  private hasData(illnessCode: string, version: number): boolean {
    return !!illnessValue(illnessCode, version)(this.state);
  }

  private hasSyncedData(idIcd10Code: string, version: number): boolean {
    return !!_.find(this.workableIllnesses, {idIcd10Code, version});
  }

  private get nonWorkableIllnesses(): Illness.FormValue[] {
    if (this.syncedIllnesses) {
      const illStatesNames = this.state.global.illStates;
      return _.concat(
        this.syncedIllnesses[this.isReviewer ? illStatesNames.approved : illStatesNames.complete] || [],
        this.syncedIllnesses[illStatesNames.protected] || []);
    } else {
      return [];
    }
  }

  private get workableIllnesses(): Illness.FormValue[] {
    if (this.syncedIllnesses) {
      const illStatesNames = this.state.global.illStates;
      return this.syncedIllnesses[this.isReviewer ? illStatesNames.readyForReview : illStatesNames.pending] || [];
    } else {
      return [];
    }
  }

  private goToEdit(): void {
    this.router.navigate(this.isReviewer ? ["review"] : ["workbench", "general"]);
  }

  ngOnDestroy() {
    _.each(this.subs, sub => sub.unsubscribe());
  }

  private getSymptomGroups(restoreValue: Illness.FormValue) {
    return _.reject(
      restoreValue.symptomGroups,
      sg => sg.categories && !sg.categories.length)
  }

  private dispatchPostMsg(restoreValue: Illness.FormValue, idIcd10Code: string, version: number) {
    if (_.isEqual(normalizeIllness(restoreValue), illnessValue(idIcd10Code, version)(this.state))) {
      this.s.dispatch({
        type: POST_MSG,
        text: idIcd10Code + " restored successfully.",
        options: {type: "success"}
      });
    } else {
      this.s.dispatch({
        type: POST_MSG,
        text: `Unable to restore ${idIcd10Code} v${version}.`,
        options: {type: "error"}
      });
    }
  }

  private onModalRefResultError (reason: string)  {
    /* istanbul ignore next */
    if (reason !== "Cross click" || reason !== "cancel" as string) {
      console.error("Modal error: ", reason);
    }
  }

  /* istanbul ignore next */
  private handleUpsertObservable(idIcd10Code: string, version: number, o: Observer<boolean>) {
    if (isReviewer(this.s.getState()) && !illnessValue(idIcd10Code, version)(this.state)) {
      try {
        const upsert = _.find(this.workableIllnesses, {idIcd10Code}) as Illness.FormValue;

        if (!upsert) o.error(new Error("Unable to find workable illness"));

        this.s.dispatch(upsertIllness(upsert));
        o.next(true);
      } catch (error) {
        o.error(new Error("Unable to upsert data for reviewer: " + idIcd10Code));
      }
    } else {
      o.next(true);
    }
    o.complete();
  }

  /* istanbul ignore next */
  private setActiveIllness(name: string, idIcd10Code: string, version: number, illnessValues: Array<any>) {
    const ecwIllness = illnessValues[1];
    const nlpIllness = illnessValues[2];
    const nlpSymptoms = illnessValues[3];
    const taskId = this.task.taskId;
    const illStatesNames = this.state.global.illStates;
    this.s.dispatch(setActiveIllness(
      taskId,
      idIcd10Code,
      name,
      version,
      this.isReviewer ? illStatesNames.readyForReview : illStatesNames.pending
    ));
    const activeIllness = activeIllnessValue(this.state);

    if (activeIllness) {
      this.removeNotExistingNlpSymptoms(nlpIllness, activeIllness);
      this.s.dispatch(setEcwValidationIllness(ecwIllness, activeIllness, nlpIllness));

      this.validation.addSymptomsErrorsToTODO(activeIllness);
    }
    this.goToEdit();
  }

  private removeNotExistingNlpSymptoms(nlpIllness: ECW.IllnessData, activeIllness: Illness.Normalized.IllnessValue) {
    if (nlpIllness && nlpIllness.symptomGroups && nlpIllness.symptomGroups.length) {
      const allSymptoms = entities(this.state).symptoms;
      nlpIllness.symptomGroups = (nlpIllness as ECW.IllnessData).symptomGroups
        .map(symptomGroup => {
        (symptomGroup.categories || []).map(category => {
          category.symptoms = category.symptoms.filter(symptom => !!allSymptoms[symptom.symptomID]);
          return category;
        });
        return symptomGroup;
      });
    }
  }
}
