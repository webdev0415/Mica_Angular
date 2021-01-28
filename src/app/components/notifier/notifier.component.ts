import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnDestroy
} from "@angular/core";
import * as _ from "lodash";
import { Observable, Subscription, Subject } from "rxjs";
import { NgRedux, select } from "@angular-redux/store";
import { POST_UNDO, DEL_MSG } from "app/state/messages/messages.actions";
import {
  trigger,
  state,
  style,
  animate,
  transition
} from "@angular/animations";
import { distinctUntilChanged } from "rxjs/operators";
import { Router, NavigationEnd } from "@angular/router";

@Component({
  animations: [
    trigger("messageInOut", [
      state("in", style({
        transform: "translateY(0)",
        opacity: 1
      })),
      transition("void => *", [
        style({
          transform: "translateY(100%)",
          opacity: 0
        }),
        animate("300ms ease-in")
      ]),
      transition("* => void", [
        animate("300ms ease-out", style({
          transform: "translateY(-100%)",
          opacity: 0
        }))
      ])
    ])
  ],
  selector: "mica-notifier",
  templateUrl: "./notifier.component.html",
  styleUrls: ["./notifier.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotifierComponent implements OnInit, OnDestroy {
  @select(["messages", "queue"]) queue$: Observable<MICA.NotificationMessage[]>;
  publisher: Subject<MICA.NotificationMessage[]> = new Subject();

  private subs: Subscription[] = [];

  constructor(private cd: ChangeDetectorRef,
              private store: NgRedux<State.Root>,
              private router: Router) {
                router.events.subscribe( val => {
                  if ( val instanceof NavigationEnd) {
                    this.publisher.next([]);
                  }
                });
               }

  ngOnInit() {
    const queueSub = this.queue$
      .pipe(
        distinctUntilChanged((prev, next) => _.isEqual(prev, next))
      )
      .subscribe(nextQ => {
        this.publisher.next(nextQ || []);
        _.each(nextQ, m => {
          if (m.id && (!_.has(m.options, "autoClose") || (_.has(m.options, "autoClose") && m.options.autoClose))) {
            this.delMessageTimeout(m.id)
          }
        });
        this.cd.markForCheck();
      });

    this.subs.push(queueSub);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  onUndo(m: MICA.NotificationMessage) {
    if (m.id) this.delMessageTimeout(m.id);
    this.store.dispatch({
      type: POST_UNDO,
      message: m
    });
  }

  delMessage(id: number): void {
    this.store.dispatch({
      type: DEL_MSG,
      id: id
    });
  }

  delMessageTimeout(id: number): NodeJS.Timer {
    return setTimeout(() => this.delMessage(id), 9000);
  }

  getAlertClass(o: MICA.NotificationOptions) {
    switch (o["type"]) {
      case "success":
        return "bg-success";
      case "warning":
        return "bg-warning";
      case "error":
      case "danger":
        return "bg-danger";
      default:
        return "bg-primary";
    }
  }

  getBtnClass(o: MICA.NotificationOptions) {
    switch (o["type"]) {
     case "success":
        return "btn-success";
      case "warning":
        return "btn-warning";
      case "error":
        return "btn-danger";
      default:
        return "btn-info";
    }
  }

  trackByFunc(idx: number, item: MICA.NotificationMessage) {
    return item.id;
  }

}
