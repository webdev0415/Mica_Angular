import { activeIllnessID, activeIllnessValueDenorm, areSymptomGroupsValid } from "../../../../state/workbench/workbench.selectors";
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef
} from "@angular/core";
import { NgRedux, select } from "@angular-redux/store";
import { Observable, Subscription } from "rxjs";
import { Router } from "@angular/router";
import {
  NgbModal,
  NgbModalRef,
  NgbTooltip
} from "@ng-bootstrap/ng-bootstrap";

import { IllnessService, AuthService } from "app/services";
import * as _ from "lodash";
import { POST_MSG } from "app/state/messages/messages.actions";
import { finalize } from "rxjs/operators";
import { activeSymptomGroupHasAnySymptoms } from "app/state/workbench/workbench.selectors";
import {ModalComponent} from "../../../gui-widgets/components/modal/modal.component";

@Component({
  selector: "mica-header-user",
  templateUrl: "./user.component.html",
  styleUrls: ["./user.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserComponent implements OnInit, OnDestroy {
  @select(["user"]) currentUser$: Observable<MICA.User.Data>;
  @select(areSymptomGroupsValid) areSymptomGroupsValid: Observable<boolean>;
  @select(activeIllnessID) activeIllnessID: Observable<string>;
  @ViewChild("syncTooltip", {static: false}) private syncTooltip: NgbTooltip;
  @select(activeSymptomGroupHasAnySymptoms) activeSymptomGroupHasAnySymptoms: Observable<boolean>;

  syncing = false;
  syncLogout = "";
  user: MICA.User.Data;

  private subs: Subscription[] = [];
  private modalRef: NgbModalRef;
  private get state() { return this.s.getState(); }

  constructor(private s: NgRedux<State.Root>,
              private illnessSvc: IllnessService,
              private modalService: NgbModal,
              private router: Router,
              private cd: ChangeDetectorRef,
              private auth: AuthService) {}


  ngOnInit() {
    const userSub = this.currentUser$
      .subscribe(u => {
        this.user = u;
        this.cd.markForCheck();
      });

    this.subs.push(userSub);
  }

  ngOnDestroy() {
    _.each(this.subs, sub => sub.unsubscribe());
  }

  onLogOut(template: TemplateRef<any>) {
    this.modalRef = this.modalService.open(template);
    this.modalRef.result
      .then(null,
        reason => {
          if (reason === "log-out") {
            this.router.navigate(["logout"]);
          }
        });
  }

  logOutWithSync(): void {
    const sub = this.auth.isAuthenticated$.subscribe((allowed: boolean) => {
      if (!allowed) {
        this.router.navigate(["logout"]);
        return;
      }
      if (this.modalRef) {
        this.syncLogout = "Syncing your data before logging out...";
        const value = activeIllnessValueDenorm(this.state);
        if (!value) {
          console.error("No illness to sync");
          return;
        } else this.illnessSvc.syncIllnessData(value)
          .subscribe(data => {
            this.modalRef.close();
            this.router.navigate(["logout"]);
          });
      }
    });
    this.subs.push(sub);
  }

  get syncBtnClass(): string {
    if (this.syncing) return "btn-default";
    return "btn-primary";
  }

  onSyncData() {
    const sub = this.auth.isAuthenticated$.subscribe((allowed: boolean) => {
      if (!allowed) {
        this.router.navigate(["logout"]);
        this.auth.showWidget();
        return;
      }
      this.syncing = true;
      const value = activeIllnessValueDenorm(this.state);
      if (!value) {
        console.error("No illness to sync");
        return;
      } else this.illnessSvc.syncIllnessData(value)
        .pipe(
          finalize(() => {
            this.syncing = false;
            this.cd.markForCheck();
          })
        )
        .subscribe(data => {
          this.syncing = false;
          this.s.dispatch({
            type: POST_MSG,
            text: `${data.icd10CodesStatus[0]} saved successfully.`,
            options: { type: "success" }
          });
          this.cd.markForCheck();
        });
    });
    this.subs.push(sub);
  }

  onChangeApp() {
    const modal = this.modalService.open(ModalComponent);

    modal.componentInstance.data = {
      title: "Leave app?",
      body: "Are you sure you would like to leave the app? Any unsaved changes will be lost.",
      actionTxt: "Leave",
      actionName: "leave",
      cancelTxt: "Stay"
    };
    modal.result.then(res => {
      if (res === "leave") {
        this.router.navigate(["/"]);
      }
    }, reason => {
      console.log(reason);
    })
  }

}
