import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {activeSymptomGroup} from "../../../../state/nav/nav.selectors";
import {NgRedux, select} from "@angular-redux/store";
import {Observable} from "rxjs/Rx";
import {WorkbenchService} from "../../services/workbench.service";
import * as _ from "lodash";
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import * as MICAValidators from "../../../../util/forms/validators/index";
import {formGroupFactory} from "../../../../util/forms/create";
import {environment} from "../../../../../environments/environment";

@Component({
  selector: "mica-edit-symptom",
  templateUrl: "./edit-symptom.component.html",
  styleUrls: ["./edit-symptom.component.sass"]
})
export class EditSymptomComponent implements OnInit{
  @select(activeSymptomGroup) symptomGroup: Observable<String>;
  @Output() close: EventEmitter<boolean> = new EventEmitter();
  private get state() { return this.s.getState() }
  snoMedForm: FormGroup;
  rowEdit = "";
  data: any;
  newData: any;

  sympData = {
    "name": "Seasonality",
    "symptomID": "SYMPT0000004",
    "definition": "",
    "criticality": 6,
    "multipleValues": "test",
    "snomedCodes": "",
    "antithesis": {
      "Winter": 0.25,
      "root": 0.25,
      "Summer": 0.25,
      "Fall": 0.25,
      "Spring": 0.25
    },
    "icd10RCodes": {
      "Winter": "Bsada",
      "root": null,
      "Summer": "Afds",
      "Fall": null,
      "Spring": null
    },
    "displayListValues": {
      "Winter": false,
      "root": false,
      "Summer": false,
      "Fall": true,
      "Spring": true
    },
    "treatable": true,
    "displayDrApp": true,
    "question": "Can you select the current season?",
    "es_question": ""
  };
  selectedSymp: any;
  editableProperties: Symptom.EditableMetadata[];
  max = 9;
  minMax = [0, 1];
  isProduction = environment.production;
  rows: any = [];
  multipleValues: any = [];
  test: number;
  showModel = false;
  rowInput = true;
  isActive= false;
  size: "" | "sm" = "";
  get dropdownToggleClass() { return this.size ? `btn-${this.size}` : ""}
  mulValues = ["AlcoholConsumption", "Drug", "test", "tests"];

  constructor(private workbenchService: WorkbenchService, private s: NgRedux<State.Root>, public router: Router) {
    // this.selectedSymp = this.workbenchService.getSelectedSnoMedSymtom();
  }

  ngOnInit() {
    if (this.router.url.includes("/new-symptom")) {
      this.newData = {
        "name": "Seasonality",
        "symptomID": "SYMPT0000004",
        "definition": "",
        "criticality": 0,
        "snomedCodes": "",
        "multipleValues": "",
        "antithesis": {
          "root": null
        },
        "icd10RCodes": {
          "root": null
        },
        "displayListValues": {
          "root": false
        },
        "treatable": false,
        "question": "",
        "es_question": "",
        "displayDrApp": true
      };
      this.data = this.newData;
    } else {
      this.data = this.sympData;
    }
    const formValues: any = {};
    this.test = 0;
    _.each(this.data, (i: any, k: any) => {
      if (k !== "name" && k !== "symptomID") {
        if (k === "es_question") {
          k = "questionInSpanish";
        }
        this.rows.push([k, i]);
        if (typeof(i) === "object") {
          if (!this.test) {
            _.each(i, (j: any, l: any) => {
              if (l !== "root") {
                this.multipleValues.push(l);
              }
              this.test = 1;
            });
          }
          if (k === "displayListValues" || k === "icd10RCodes") {
            formValues[k] = formGroupFactory(i, this.state, false) as FormGroup;
            if (k === "icd10RCodes") {
              _.each(formValues[k].controls, (ctrl, l) => {
                ctrl.setValidators(MICAValidators.rCode);
              });
            }
          } else if (k === "antithesis") {
            formValues[k] = formGroupFactory(i, this.state, true) as FormGroup;
          }
        } else {
          formValues[k] = this.retFormCtrl(k, i);
        }
      }
    });
    this.rows.sort(this.sortFunction);
    this.snoMedForm = new FormGroup(formValues);
  }

  retFormCtrl(key: any, val: any) {
    if (key === "criticality") {
      return new FormControl(val, [Validators.required, MICAValidators.minMax(0, 9)]);
    } else if (key === "treatable") {
      if (val === "" || val === null) {
        val = false;
      }
      return new FormControl(val, [Validators.required, Validators.pattern(/true|false/)]);
    } else if (key === "displayDrApp") {
      if (val === "" || val === null) {
        val = true;
      }
      return new FormControl(val, [Validators.required, Validators.pattern(/true|false/)]);
    } else {
      return new FormControl(val, [Validators.required]);
    }
  }

  sortFunction(a: any, b: any) {
    if (a[0] === b[0]) {
      return 0;
    } else {
      return (a[0] < b[0]) ? -1 : 1;
    }
  }

  retFormGroup(listVal: string , list: any = {}) {
    const group: any = {};
    if (listVal === "displayListValues" || listVal === "icd10RCodes") {
      _.each(list, (val: any, key: any) => {
        if (listVal === "displayListValues") {
          if (val === "" || val == null) {
            val = false;
          }
        }
        group[key] = new FormControl(val);
      });
    } else if (listVal === "antithesis") {
      _.each(list, (val: any, key: any) => {
        group[key] = new FormControl(val, Validators.required);
      });
    }
    return new FormGroup(group);
  }

  enterInput(rowItem: any) {
    this.rowInput = rowItem.length <= 0;
  }

  createList(listItem: any) {
    this.showModel = false;
    if (listItem.length > 0) {
      this.multipleValues.push(listItem);
      (this.snoMedForm.get("displayListValues") as FormGroup).addControl(listItem, new FormControl(false));
      (this.snoMedForm.get("antithesis") as FormGroup).addControl(listItem, new FormControl("", [Validators.required]));
      (this.snoMedForm.get("icd10RCodes") as FormGroup).addControl(listItem, new FormControl("", [MICAValidators.rCode]));
    }
  }

  removeRow(listItem: any) {
    const index = this.multipleValues.indexOf(listItem);
    if (index !== -1) {
      this.multipleValues.splice(index, 1);
    }
    // this.multipleValues.pop(listItem);
    (this.snoMedForm.get("displayListValues") as FormGroup).removeControl(listItem);
    (this.snoMedForm.get("antithesis") as FormGroup).removeControl(listItem);
    (this.snoMedForm.get("icd10RCodes") as FormGroup).removeControl(listItem);
  }

  trackByFn(index: number, value: [string | number, AbstractControl]): number {
    return index;
  }

  onSubmit(formValue: any) {
    console.log(formValue);
  }

  selectValue(selector: any, value: any) {
    this.snoMedForm.controls[selector].setValue(value);
  }

  get shouldShow(): boolean {
    const email = this.state.user.email;
    const debugUsers = ["jim-shelby@gorvw.net", "shelbymita@gmail.com",
      "vijetha@techmileage.com", "shelbyzgow@gmail.com", "govinda@gmail.com",
      "govinda2@gmail.com", "vijetha5@gmail.com", "vijetha4@gmail.com", "pmunagal@asu.edu", "pragna1@gmail.com"];
    return !this.isProduction || !!~_.indexOf(debugUsers, email);
  }
}
