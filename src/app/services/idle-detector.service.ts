import { Inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { AuthService } from "./auth.service";
import { NgRedux } from "@angular-redux/store";
import { AUTH_CONFIG } from "../app.config";
import {fromEvent, merge} from "rxjs";
import {throttleTime} from "rxjs/operators";

@Injectable()
export class IdleDetectorService {
  private timerSrc: NodeJS.Timer;
  private activity: Observable<Event>;
  private resetter: Subscription;

  constructor(@Inject(AUTH_CONFIG) private authConfig: MICA.Auth0Configuration,
              private s: NgRedux<State.Root>,
              private auth: AuthService,
              private router: Router) {
    const mouseDetector: Observable<Event> = fromEvent(document, "mousemove");
    const keyDetector: Observable<Event> = fromEvent(document, "keypress");
    this.activity = merge(mouseDetector, keyDetector)
      .pipe(
        throttleTime(this.s.getState().global.idleTime / 2)
      );
  }

  start() {
    this.timerSrc = this.timer;
    this.resetter = this.activity.subscribe(ev => {
      this.resetTimer();
    });
  }

  stop() {
    if (this.resetter) this.resetter.unsubscribe();
    if (this.timerSrc) clearInterval(this.timerSrc);
  }

  private resetTimer() {
    if (this.timerSrc) clearInterval(this.timerSrc);
    this.timerSrc = this.timer;
  }

  private get timer(): NodeJS.Timer  {
    return setInterval(() => {
      this.router.navigate(["inactive"]);
    }, this.s.getState().global.idleTime);
  }

}
