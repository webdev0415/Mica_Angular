import { upsertIllness } from "app/state/workbench/workbench.actions";
import { illnessValues } from "app/state/workbench/workbench.selectors";
import {
  Component,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef
} from "@angular/core";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { BehaviorSubject, EMPTY, Observable, Subscription, throwError } from "rxjs";
import { NgRedux } from "@angular-redux/store";
import { SymptomService, AuthService, IllnessService, SourceService } from "../../services";
import { symptomItemsIDs } from "app/state/nav/nav.selectors";
import * as _ from "lodash";
import {
  SET_USER,
  SET_SYMPTOMS_DATA,
  SET_BOOTSTRAP,
  UPGRADE_GLOBAL,
  UPGRADE_MESSAGES,
  UPGRADE_NAV,
  UPGRADE_USER,
  UPGRADE_SYMPTOMS
} from "app/state/actionTypes";
import stateUpdater from "app/state/util/updater";
import { SET_SYMPTOM_DEFINITION } from "app/state/symptoms/symptoms.actions";
import { isReviewer } from "app/state/user/user.selectors";
import { catchError, finalize, reduce, switchMap, take, tap } from "rxjs/operators";
import { setIllnesses } from "app/state/illnesses/illnesses.actions";
import { GroupService } from "app/services/group.service";
import { setGroups } from "app/state/groups/groups.actions";
import { LaborderService } from "app/services/laborder.service";
import { SetLabOrders } from "app/state/laborders/laborders.actions";

@Component({
  selector: "mica-bootstrapper",
  templateUrl: "./bootstrapper.component.html",
  styleUrls: ["./bootstrapper.component.sass"]
})
export class BootstrapperComponent implements OnInit, OnDestroy {
  @Output() complete: EventEmitter<boolean> = new EventEmitter();

  private get state() {
    return this.s.getState()
  }

  private subs: Subscription[] = [];
  private returnUrl = "";
  private progressWeights = {
    init: 2,
    stateVersion: 3,
    identity: 10,
    symptomGroups: 65,
    sync: 20
  };
  steps = {
    stateVersion: "stateVersion",
    identity: "identity",
    sg: "sg",
    sync: "sync"
  };
  bootstrapError: Error;
  progress: BehaviorSubject<MICA.BootstrapProgress> = new BehaviorSubject(this.progressToken());

  constructor(private s: NgRedux<State.Root>,
              private auth: AuthService,
              private illnessSvc: IllnessService,
              private symptom: SymptomService,
              private sourceService: SourceService,
              private groupService: GroupService,
              private router: Router,
              private route: ActivatedRoute,
              private cd: ChangeDetectorRef,
              private laborderService: LaborderService) {
  }


  ngOnInit() {
    this.progress.next(this.progressToken(this.progress.getValue(), {
      stepStarted: this.steps.stateVersion,
    }));
    const needsUpdate = stateUpdater.isVersionOld(this.state);

    if (needsUpdate.length) {
      this.s.dispatch({ type: UPGRADE_GLOBAL });
      this.s.dispatch({ type: UPGRADE_MESSAGES });
      this.s.dispatch({ type: UPGRADE_NAV });
      this.s.dispatch({ type: UPGRADE_USER });
      this.s.dispatch({ type: UPGRADE_SYMPTOMS });
    }
    this.progress.next(this.progressToken(this.progress.getValue(), {
      progress: this.progressWeights.stateVersion,
      stepCompleted: this.steps.stateVersion,
    }));

    this.route.queryParams
      .pipe(
        tap(this.setReturnUrl.bind(this)),
        take(1),
        tap(() => {
          this.progress.next(this.progressToken(this.progress.getValue(), {
            stepStarted: this.steps.identity,
          }));
        }),
        switchMap(this.identityCheck.bind(this)),
        switchMap(this.loadSGStream.bind(this)),
        switchMap(this.onSymptomGroups.bind(this)),
        tap(this.setSyncProgress.bind(this)),
        switchMap(this.loadIllnessesStream.bind(this)),
        tap(this.loadSymptomGroups.bind(this)),
        tap(this.loadLaborders.bind(this)),
        switchMap(this.syncIllnesses.bind(this)),
        catchError(err => {
          console.error(err);
          this.bootstrapError = err;
          this.cd.markForCheck();
          return throwError(err);
        }),
        finalize(this.onComplete.bind(this))
      )
      .subscribe(
        this.onSyncIllnesses.bind(this)
      );
  }

  ngOnDestroy() {
    _.each(this.subs, s => s.unsubscribe());
  }

  private progressToken(current?: MICA.BootstrapProgress, update?: MICA.BootstrapProgress): MICA.BootstrapProgress {
    if (current && update) {
      const loadedUpdate = update["symptomGroupsLoaded"];
      const currentlyLoaded = current.symptomGroupsLoaded || 0;
      /* istanbul ignore next */
      return {
        finished: update["finished"] || current.finished,
        symptomGroupsLoaded: loadedUpdate
          ? loadedUpdate + currentlyLoaded : current.symptomGroupsLoaded,
        progress: update["progress"] ? (current.progress || 0) + (update["progress"] || 0) : current.progress,
        stepsStarted: update["stepStarted"] ? (current.stepsStarted || new Set()).add(update["stepStarted"]) : current.stepsStarted,
        stepsCompleted: update["stepCompleted"] ? (current.stepsCompleted || new Set()).add(update["stepCompleted"]) : current.stepsCompleted,
      };
    } else {
      return {
        finished: false,
        symptomGroupsLoaded: 0,
        progress: this.progressWeights.init,
        stepsStarted: new Set(),
        stepsCompleted: new Set()
      };
    }
  }

  private identityCheck(): Observable<MICA.User.Data | null> {
    return this.auth.auth0State
      .pipe(
        take(1),
        tap(userData => {
          if (!userData) throw new Error("No user data to start bootstrapper with");
          const userStateEmail = this.state.user.email;
          const userHasChanged = !userStateEmail || userStateEmail !== userData.email;
          if (userHasChanged) {
            this.s.dispatch({type: "RESET_STATE"});
          }
          if (!userStateEmail || userHasChanged) {
            this.s.dispatch({
              type: SET_USER,
              user: userData
            });
          }
        }),
        finalize(() => {
          this.progress.next(this.progressToken(this.progress.getValue(), {
            progress: this.progressWeights.identity,
            stepCompleted: this.steps.identity,
          }));
          this.progress.next(this.progressToken(this.progress.getValue(), {
            stepStarted: this.steps.sg,
          }));
        })
      );
  }

  private loadSGStream(): Observable<Workbench.SymptomGroup[]> {
    return this.symptom.symptomGroupAll(this.state)
      .pipe(
        tap(
          sg => {
            this.s.dispatch({
              type: SET_SYMPTOMS_DATA,
              data: sg
            });
            this.progress.next(this.progressToken(this.progress.getValue(), {
              progress: this.progressWeights.symptomGroups / symptomItemsIDs(this.state).length,
              symptomGroupsLoaded: 1
            }));
          },
          err => console.error(err),
          () => {
            this.progress.next(this.progressToken(this.progress.getValue(), {
              stepCompleted: this.steps.sg,
            }));
          }
        ),
        reduce((sgs: any, sg: any) => _.concat(sgs, sg), [])
      );
  }

  private loadIllnessesStream(): Observable<Illness.DataShort[]> {
    return this.illnessSvc.getIllnesses()
      .pipe(
        take(1),
        tap(illnesses => {
          this.s.dispatch(setIllnesses(illnesses))
        })
      );
  }

  private get loadDefinitions(): Observable<Symptom.Definition[]> {
    return this.symptom.getSymptomDefinitions()
      .pipe(
        take(1),
        tap(defs => {
          this.s.dispatch({
            type: SET_SYMPTOM_DEFINITION,
            values: defs
          })
        })
      );
  }

  private syncIllnesses(): Observable<Illness.FormValue[]> {
    const userData = this.state.user;
    const illStates = this.state.global.illStates;
    const requestStates = userData.roleName === "collector" ? [illStates.pending] : [illStates.readyForReview];

    return this.illnessSvc
      .getUserIllnessSavedByState(requestStates)
      .pipe(
        take(1),
        finalize(() => {
          this.progress.next(this.progressToken(this.progress.getValue(), {
            progress: this.progressWeights.sync,
            stepCompleted: this.steps.sync,
          }));
        })
      );
  }

  private actionCSSClass(step: string, p: MICA.BootstrapProgress): string {
    if (p.stepsCompleted && p.stepsCompleted.has(step)) return "list-group-item-success";
    if (p.stepsStarted && p.stepsStarted.has(step)) return "list-group-item-warning";
    return "";
  }

  private actionLabel(step: string, p: MICA.BootstrapProgress): string {
    if (p.stepsCompleted && p.stepsCompleted.has(step)) return "done";
    if (p.stepsStarted && p.stepsStarted.has(step)) return "hourglass_full";
    return "hourglass_empty";
  }

  private setReturnUrl(params: Params) {
    this.returnUrl = params["returnUrl"] ? params["returnUrl"] : "/";
  }

  private onSymptomGroups(): Observable<any> {
    if (isReviewer(this.state)) return this.loadDefinitions;
    return EMPTY;
  }

  private onSyncIllnesses(syncIllnesses: Illness.FormValue[]) {
    const localIllnesses = illnessValues(this.state);
    if (!localIllnesses.length) {
      _.each(syncIllnesses, illness => {
        this.s.dispatch(upsertIllness(illness));
      });
    }
  }

  private onComplete() {
    const p = this.progress.getValue();
    this.progress.next({
      finished: true,
      symptomGroupsLoaded: p.symptomGroupsLoaded,
      progress: 100,
      stepsStarted: p.stepsStarted,
      stepsCompleted: p.stepsCompleted
    });
    this.s.dispatch({
      type: SET_BOOTSTRAP,
      value: true
    });
    this.router.navigate([this.returnUrl]);
  }

  private setSyncProgress() {
    this.progress.next(this.progressToken(this.progress.getValue(), {
      stepStarted: this.steps.sync,
    }));
  }

  private loadSymptomGroups() {
    this.groupService.getAllGroups().pipe(take(1)).subscribe(groups => {
      this.s.dispatch(setGroups(groups));
    });
  }

  private loadLaborders() {
    this.laborderService.getLabOrders().pipe(take(1)).subscribe(laborders => {
      this.s.dispatch(SetLabOrders(laborders));
    });
  }

}
