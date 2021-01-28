import { Router } from "@angular/router";
import { upgradeSymptomTemplates } from "./../../../../state/symptom-templates/templates.actions";
import { NgRedux } from "@angular-redux/store";
import { Observable } from "rxjs";
import { TemplateService } from "../../../../services/template.service";
import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from "@angular/core";
import * as _ from "lodash";
import {finalize} from "rxjs/operators";

@Component({
  selector: "mica-error-finder",
  templateUrl: "./error-finder.component.html",
  styleUrls: ["./error-finder.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorFinderComponent implements OnInit {
  loading = true;
  errors = this.templateSvc.errors
    .pipe(
      finalize(() => this.loading = false)
    );

  constructor(private templateSvc: TemplateService,
              private s: NgRedux<State.Root>,
              private router: Router,
              private cd: ChangeDetectorRef) { }

  ngOnInit() {
  }

  trackByFn(index: number, row: Symptom.TemplateError) {
    return index;
  }

  onEditSymptom(symptomID: string, ev: Event) {
    ev.preventDefault();
    this.templateSvc.getTemplate(symptomID)
      .subscribe(template => {
        this.s.dispatch(upgradeSymptomTemplates(template || null));
        this.router.navigate(["/templates/editor"]);
      });
  }


}
