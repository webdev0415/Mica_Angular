import {
  Component,
  OnInit,
  Input,
  OnChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from "@angular/core";
import { AbstractControl, FormGroup, FormControl, FormArray } from "@angular/forms";
import { NgRedux } from "@angular-redux/store";
import * as _ from "lodash";
import { allGroupsSelector } from "app/state/groups/groups.selectors";
import { allLabordersSelector } from "app/state/laborders/laborders.selectors";

@Component({
  selector: "templates-table",
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent implements OnInit, OnChanges {
  @Input() sympForm: FormGroup;
  @Input() sympData: Symptom.Data;
  @Input() isLabSymptom: boolean;
  editableProperties: Symptom.EditableMetadata[];
  rowEdit = "";
  // isLabSymptom = false;

  // private specialProperties = ["antithesis"];
  private get state() {
    return this.s.getState()
  }

  // get multiplierValues() { return (multiplierValues(this.sympData)(this.state) || {title: "", values: []}).values }
  get rows() {
    return _.map(this.editableProperties, p => [p.name, this.sympForm.get(p.key)])
  }

  // get listValuesGroup() { return this.sympForm.get("displayListValues")}
  get isLoading() {
    return !_.keys(this.sympForm.controls).length
  }

  ctx: any;
  symptomGroups: MICA.SelectableEl[];
  labordered: MICA.SelectableEl[];
  groupList: Groups.Group[];
  laborderList: Laborders.Laborder[];

  constructor(private cd: ChangeDetectorRef,
              private s: NgRedux<State.Root>) {
  }

  ngOnInit() {
    this.editableProperties = _.sortBy(
      this.state.symptomTemplates.editableProperties,
      prop => prop.name.toLowerCase());
    this.getSymptomGroups();
    if (this.isLabSymptom) {
      this.getLaborders();
    }
  }

  ngOnChanges(): void {
    this.rowEdit = "";
    this.ctx = this.getContext();
  }

  trackByFn(index: number, value: [string | number, AbstractControl]): number {
    return index;
  }

  inputType(name: string): string {
    const editableProps = _.find(this.editableProperties, {"name": name});
    return editableProps ? typeof editableProps.defaultValue : "";
  }

  getMinMax(name: string): [number, number] {
    const editableProps = _.find(this.editableProperties, {"name": name});
    return editableProps && editableProps.minMax ? editableProps.minMax : [-1, -1];
  }

  onSubmit(value: any) {
    console.log("FOR SUBMISSION: ", this.sympForm.value);
    // TODO: rehydrate
  }


  getContext() {
    const ctx: { [key: string]: { name: string, ctrl: AbstractControl | AbstractControl[] | null, editable?: boolean } } = {
      criticality: {
        name: "Criticality",
        ctrl: this.sympForm.get("criticality"),
        editable: true,
      },
      definition: {
        name: "Definition",
        ctrl: this.sympForm.get("definition"),
        editable: true,
      },
      displayDrApp: {
        name: "Display Doctor App",
        ctrl: this.sympForm.get("displayDrApp"),
        editable: true
      },
      question: {
        name: "Question",
        ctrl: this.sympForm.get("question"),
        editable: true
      },
      es_question: {
        name: "Question in Spanish",
        ctrl: this.sympForm.get("es_question"),
        editable: true
      },
      treatable: {
        name: "Treatable",
        ctrl: this.sympForm.get("treatable"),
        editable: true
      },
      cardinality: {
        name: "Multiple Answers",
        ctrl: this.sympForm.get("cardinality"),
        editable: true
      },
      genderGroup: {
        name: "Gender Group",
        ctrl: this.sympForm.get("genderGroup")
      },
      groupID: {
        name: "DE Group",
        ctrl: this.sympForm.get("groupID")
      },
      labsOrdered: {
        name: "Labs Ordered",
        ctrl: this.sympForm.get("labsOrdered")
      }
    };

    const {rootOptionCtrl, arrCtrl} = this.calcAdditionalInfo();
    ctx["antithesis"] = {
      name: "Antithesis",
      ctrl: rootOptionCtrl.get("antithesis"),
      editable: true
    };
    ctx["displaySymptom"] = {
      name: "Display Symptom",
      ctrl: rootOptionCtrl.get("displaySymptom")
    };
    ctx["icd10RCodes"] = {
      name: "ICD Symptom Codes",
      ctrl: rootOptionCtrl.get("icd10RCodes")
    };
    ctx["snomedCodes"] = {
      name: "SnoMed Symptom Codes",
      ctrl: rootOptionCtrl.get("snomedCodes")
    };
    if (arrCtrl.length) {
      ctx["additionalValues"] = {
        name: "Row-specific values",
        ctrl: arrCtrl
      }
    }
    return ctx;
  }

  calcAdditionalInfo() {
    let rootOptionCtrl = new FormGroup({});
    const arrCtrl: FormGroup[] = [];
    const additionalInfo = this.sympForm.get("additionalInfo") as FormArray;
    additionalInfo.controls.forEach((fg: FormGroup) => {
      if (!fg.get("antithesis"))
        fg.setControl("antithesis", new FormControl(0));
      if (fg.get("icd10RCodes") instanceof FormArray) {
        fg.setControl("icd10RCodes", new FormControl([]));
      }
      const icd10RCodes = fg.get("icd10RCodes") as FormControl;
      if (!icd10RCodes.value) {
        icd10RCodes.setValue([]);
      }
      if (!(fg.get("snomedCodes") instanceof FormArray)) {
        fg.setControl("snomedCodes", new FormArray([new FormGroup({
          snomedCodes: new FormControl([]),
          snomedName: new FormControl("")
        })]));
      }
      const value = fg.value;
      if (value.optionCode && value.optionDescription)
        arrCtrl.push(fg);
      else {
        (fg.get("optionCode") as FormControl).setValue(null);
        rootOptionCtrl = fg;
      }
    });
    return {rootOptionCtrl, arrCtrl}
  }

  getSymptomGroups() {
    this.groupList = allGroupsSelector(this.state);
    this.symptomGroups = this.groupList.map((obj: Groups.Group) => ({ name: obj.name, value: obj.groupID.toString() }));
  }

  getLaborders() {
    this.laborderList = allLabordersSelector(this.state);
    this.labordered = this.laborderList.map((obj: Laborders.Laborder) => ({ name: obj.name, value: obj.orderID.toString() }));
  }
}
