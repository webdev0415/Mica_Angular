import { upgradeSymptomTemplates, toggleTemplateSave } from "./../../../../state/symptom-templates/templates.actions";
import { multiplierValues, symptomData } from "./../../../../state/symptoms/symptoms.selectors";
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import * as _ from "lodash";
import { select, NgRedux } from "@angular-redux/store";
import { FormGroup } from "@angular/forms";
import { symptomTemplateCtrlFactory } from "../../../../util/forms/create";
import { SymptomService } from "../../../../services";
import { TemplateService } from "../../../../services/template.service";
import { postMsg } from "../../../../state/messages/messages.actions";
import { environment } from "../../../../../environments/environment";
import { setSymptomDefinition } from "../../../../state/symptoms/symptoms.actions";
import { finalize, map, switchMapTo } from "rxjs/operators";

@Component({
  selector: "templates-editor",
  templateUrl: "./editor.component.html",
  styleUrls: ["./editor.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorComponent implements OnInit, OnDestroy {
  @select(["symptomTemplates", "data"]) data$: Observable<Symptom.Template>;
  @select(["symptomTemplates", "saving"]) saving$: Observable<Symptom.Template>;
  sympForm: FormGroup = new FormGroup({});
  sympTemplate: Symptom.Template;
  sympData: Symptom.Data;
  isProduction = environment.production;
  valueWithDefault: Symptom.Template;
  private formSub: Subscription;
  private get state() { return this.s.getState() }
  private subs: Subscription[] = [];
  get multiplierValues() {
     return (multiplierValues(this.sympData)(this.state) || {title: "", values: []}).values;
  }
  private get defaultValue() {
    return _.reduce(this.state.symptomTemplates.editableProperties, (value: any, prop) => {
        value[prop.key] = _.isBoolean(prop.defaultValue) ? prop.defaultValue : "";
      return value;
    }, {symptomID: ""}) as Symptom.Template;
  };

  constructor(private s: NgRedux<State.Root>,
              private template: TemplateService,
              private sympSvc: SymptomService,
              private cd: ChangeDetectorRef) { }

  ngOnInit() {
    const sgsSub = this.sympSvc
      .rehydrateSymptomGroups() // bootstrapper should already have them all, just in case
      .pipe(
        switchMapTo(this.data$)
      )
      .subscribe(this.onSymptomTemplates.bind(this));
    this.subs.push(sgsSub)
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  onSubmit() {
    this.s.dispatch(toggleTemplateSave(true));
    this.template.saveTemplate(this.sympForm.value)
      .pipe(
        finalize(() => this.s.dispatch(toggleTemplateSave(false)))
      )
      .subscribe(res => {
        this.s.dispatch(postMsg(
          `${res.symptomID}'s template saved successfully.`,
          {type: "success"}
        ));
        this.sympSvc.rehydrateSymptomGroups(true)
          .pipe(
            map(this.setSymptomDefinition.bind(this))
          )
          .subscribe(res => {
            this.s.dispatch(postMsg(
              `Symptom's data rehydrated successfully.`,
              {type: "success"}
            ));
          });
        this.sympForm.markAsPristine();
      })
  }

  onCancel() {
    this.s.dispatch(upgradeSymptomTemplates(null));
  }

  get shouldShow(): boolean {
    const email = this.state.user.email;
    const debugUsers = ["jim-shelby@gorvw.net", "shelbymita@gmail.com",
      "vijetha@techmileage.com", "shelbyzgow@gmail.com", "govinda@gmail.com",
      "govinda2@gmail.com", "vijetha5@gmail.com", "vijetha4@gmail.com", "pmunagal@asu.edu", "pragna1@gmail.com", "chrisreviewer@gmail.com"];
    return !this.isProduction || !!~_.indexOf(debugUsers, email);
  }

  private setSymptom(d: Symptom.Template) {
    this.sympTemplate = d;
    const sympData = d && d.symptomID ? symptomData(d.symptomID)(this.state) : undefined;
    if (d && d.symptomID && !sympData) {
      console.warn("No symptom data found.")
    } else if (sympData) {
      this.sympData = sympData;
    }
    this.valueWithDefault = _.defaultsDeep(d, this.defaultValue) as Symptom.Template;

    this.sympForm = symptomTemplateCtrlFactory(this.valueWithDefault, this.state) as FormGroup;

    if (this.sympForm.controls["displayDrApp"].value === null) {
      this.sympForm.controls["displayDrApp"].setValue(true);
    }
    if (this.formSub) this.formSub.unsubscribe();
    this.s.dispatch(toggleTemplateSave(false));
  }

  private onSymptomTemplates(d: Symptom.Template) {
    this.setSymptom(d);
    this.cd.markForCheck();
  }

  private setSymptomDefinition() {
    const definitionControl = this.sympForm.get("definition");
    if (definitionControl && definitionControl.pristine) return true;
    this.s.dispatch(setSymptomDefinition([{
      code: this.sympForm.value.symptomID,
      definition: this.sympForm.value.definition
    }]));
    return true;
  }
}
