import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from "@angular/core";
import { NgRedux } from "@angular-redux/store"
import { Observable, Subscription } from "rxjs";

@Component({
  selector: "ecw-submit",
  templateUrl: "./ecw-submit.component.html",
  styleUrls: ["./ecw-submit.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EcwSubmitGroupsComponent implements OnInit, OnDestroy {
  private get state() { return this.s.getState() };

  constructor(private cd: ChangeDetectorRef,
              private s: NgRedux<State.Root>
            ) { }

  ngOnInit() {
    
  }

  ngOnDestroy() {
  }
}
