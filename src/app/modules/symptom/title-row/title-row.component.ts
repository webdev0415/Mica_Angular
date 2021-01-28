import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter
} from "@angular/core";
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
import { FormGroup } from "@angular/forms";
import { NgRedux } from "@angular-redux/store";
import * as _ from "lodash";
import { TOGGLE_EDIT } from "app/state/nav/nav.actions";
import { TemplateService } from "app/services/template.service";
import { isReviewer } from "app/state/user/user.selectors";
import { postMsg } from "app/state/actionTypes";
import { activeMandatorySymptoms } from "app/state/workbench/workbench.selectors";

@Component({
  selector: "mica-symptom-title-row",
  templateUrl: "./title-row.component.html",
  styleUrls: ["./title-row.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger("flyInOut", [
      state("in", style({
        opacity: 1,
        transform: "translateX(0)"
      })),
      transition(":enter", [
        style({
          opacity: 0,
          transform: "translateX(-100%)"
        }),
        animate("0.4s ease-in")
      ]),
      transition(":leave", [
        animate("0.3s ease-out", style({
          opacity: 0,
          transform: "translateX(-100%)"
        }))
      ])
    ])
  ]
})
export class TitleRowComponent implements OnInit {
  @Input() readOnly = false;
  @Input() symptomData: Symptom.Data;
  @Input() symptomFormGroup: FormGroup;
  @Input() bodyParts: string[] = [];
  @Input() bodyPartsAll: string[] = [];
  @Input() indexVal: number;
  @Input() maxRowsReached = false;
  @Input() isChecked = false;
  @Input() basicSymptomID: string;

  @Output() check: EventEmitter<boolean> = new EventEmitter();
  @Output() addRow: EventEmitter<boolean> = new EventEmitter();
  @Output() toggleQuestion: EventEmitter<boolean> = new EventEmitter();
  @Output() toggleBodyPart: EventEmitter<string> = new EventEmitter();

  isReviewer = isReviewer(this.s.getState());

  constructor(private s: NgRedux<State.Root>,
              private symptomService: TemplateService) {
  }

  ngOnInit() {
  }

  onCheckBoxClick(event: MouseEvent) {
    const mandatorySymptoms = activeMandatorySymptoms(this.s.getState());
    const dependentSymptoms = _.omit(
      _.pickBy(mandatorySymptoms, symptomId => _.isEqual(symptomId, this.basicSymptomID)),
      [this.basicSymptomID]
    );

    if (this.isChecked && !_.isEmpty(dependentSymptoms) && this.symptomData.symptomID === this.basicSymptomID) {
      event.preventDefault();
      this.s.dispatch(postMsg(
        `${this.symptomData.name} is mandatory for following Symptom(s) ${_.keys(dependentSymptoms).join(", ")}`,
        { type: "warning" }
      ));
    } else {
      this.check.emit(!this.isChecked)
    }
  }

  get moreThanOneRowAllowed(): boolean {
    return this.symptomData && !!this.symptomData.multipleValues;
  }

  onActivateEditAntithesis(value: boolean) {
    this.s.dispatch({
      type: TOGGLE_EDIT,
      edit: value
        ? {
          id: this.symptomData.symptomID,
          index: -1,
          name: "antithesis"
        } : null
    });
  }

  onTogglePart(part: string) {
    this.toggleBodyPart.emit(part);
  }

  onDefinitionClick() {
    this.symptomService.editSymptomTemplate(this.symptomData.symptomID, "definition")
  }

  partTrimmed(part: string) {
    return this.bodyPartsAll.length > 2
      ? part.split(" ").splice(0, 2).join(" ")
      : part;
  }

  private isBodyPartActive(part: string): boolean {
    return !!~_.indexOf(this.bodyParts, part);
  }

}
