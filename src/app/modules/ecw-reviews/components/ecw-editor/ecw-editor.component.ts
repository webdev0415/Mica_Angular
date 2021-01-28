import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  SimpleChanges
} from "@angular/core";
import { Router } from "@angular/router";
import { NgRedux } from "@angular-redux/store"
import { denormalizeIllnessValue, normalizeIllness } from "../../../../state/denormalized.model";
import { upsertEcwIllness } from "../../../../state/ecw/ecw.actions";

import { Observable, Subscription } from "rxjs";
import { EcwService } from "../../../../services/ecw.service"

@Component({
  selector: "ecw-editor",
  templateUrl: "./ecw-editor.component.html",
  styleUrls: ["./ecw-editor.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EcwEditorComponent implements OnInit, OnDestroy {
  loadingData = true;
  icd10Code: string;
  private get state() { return this.s.getState() };

  constructor(private cd: ChangeDetectorRef,
              private router: Router,
              private s: NgRedux<State.Root>
            ) { }

  ngOnInit() {
    const { icd10Code } = this.state.ecw.active;
    if (!icd10Code) {
      this.router.navigate(['ecw-reviews']);
      return;
    }
    this.loadingData = false;
  }



  ngOnDestroy() {
  }
}
