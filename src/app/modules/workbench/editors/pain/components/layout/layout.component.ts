import { insertSymptom, saveSymptom, deleteSymptom } from "app/state/workbench/workbench.actions";
import {
  activeCategoryValue,
  activeSectionCatsValue,
  symptomValue
} from "app/state/workbench/workbench.selectors";
import {
  activeSymptomGroupData,
  activeSectionData,
  activeSectionCatsData,
  catIDFromName,
  catData,
  sectionNameFromID,
  catDataDenormalized,
  symptomNameFromID,
  symptomDataPath
} from "app/state/symptoms/symptoms.selectors";
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import { trigger, state, style, transition, animate } from "@angular/animations";
import { ActivatedRoute } from "@angular/router";
import * as _ from "lodash";
import { Observable, Subscription } from "rxjs";
import { select, NgRedux } from "@angular-redux/store";
import { activeSectionSet, setActiveCategory } from "app/state/nav/nav.actions";
import { POST_MSG } from "app/state/messages/messages.actions";
import { symptomValueFactory } from "../../../../../symptom/symptom.factory";
import { isNullOrUndefined } from "util";
import { pluck } from "rxjs/operators";
import { filter, distinctUntilKeyChanged } from "rxjs/operators";

interface CopyFormValue {
  direction: string;
  bodyPartSelected: string;
}

@Component({
  animations: [
    trigger("fadeIn", [
      state("animated", style({opacity: 1})),
      transition("void => animated", [
        style({opacity: 0}),
        animate("500ms ease-out")
      ])
    ]),
    trigger("fadeInOut", [
      state("in", style({
        transform: "translateX(0)",
        opacity: 1
      })),
      transition("void => *", [
        style({
          transform: "translateX(-50%)",
          opacity: 0
        }),
        animate(500)
      ]),
      transition("* => void", [
        animate(500, style({
          opacity: 0,
        }))
      ])
    ])
  ],
  selector: "workbench-pain",
  templateUrl: "./layout.component.html",
  styleUrls: ["./layout.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkbenchPainLayoutComponent implements OnInit, OnDestroy {
  @select(activeSectionData) activeSectionData: Observable<Workbench.Normalized.Section>;
  @select(activeSectionCatsData) activeSectionCats: Observable<Workbench.Normalized.Category[]>;
  get sectionIDs(): Observable<string[]> { return this.s.select(activeSymptomGroupData).pipe(pluck("sections")) as Observable<string[]>}
  selectedBodyParts: MICA.SelectableEl[] = [];
  defaultBodyPart = "";
  svgShapes: MICA.BodyImage.ViewSVGMap;
  get defaultCopy(): ["from" | "into" | "", string] { return ["from", ""]};
  get categoryState() { return this.animateCategory ? "animated" : "non-animated" }
  copy: ["from" | "into" | "", string] = this.defaultCopy; // direction, bodyPartTrigger
  private animateCategory = false; // whether to animate on first load, only when changing categories
  private subs: Subscription[] = [];
  private get state() { return this.s.getState(); }

  constructor(private s: NgRedux<State.Root>,
              private route: ActivatedRoute,
              private cd: ChangeDetectorRef) {
    this.setSvgShapes(route);
  }

  ngOnInit() {
    // Pain doesn't have active categories
    this.s.dispatch(setActiveCategory(""));
    if (!this.state.nav.activeSection) {
      this.s.dispatch(activeSectionSet(_.get(activeSymptomGroupData(this.state), ["sections", 0])));
    }

    const paramSub = this.route.queryParams
      .pipe(
         filter(params => _.has(params, "bodyPart")),
         pluck("bodyPart")
      )
      .subscribe(this.setDefaultBodyPart.bind(this));

    const sgSub = this.activeSectionData
      .pipe(
         filter(this.exists),
         distinctUntilKeyChanged("sectionID")
      )
      .subscribe(this.onActiveSectionData.bind(this));

    this.subs.push(sgSub, paramSub);
  }

  ngOnDestroy() {
    _.each(this.subs, sub => sub.unsubscribe());
  }

  /**
   * EVENT LISTENERS
   */

  onSectionChange(sectionID: string, ev: Event): void {
    ev.preventDefault();
    this.s.dispatch(activeSectionSet(sectionID));
    this.cd.detectChanges();
  }

  onBodyPartSelect(input: MICA.BodyImage.Output): void {
    const catClicked = input.selectedPath[2];
    if (catClicked === "Whole Body") {
      if (isNullOrUndefined((input as any).selectedPath[4])) {
        return;
      }
    }
    this.animateCategory = true;
    const bodyParts = _.without(input.bodyParts, ..._.map(this.selectedBodyParts, "name"));
    try {
      this.selectedBodyParts = _.concat(this.selectedBodyParts,
        _.map(bodyParts, x => ({
            name: x,
            value: this.getCatID(x)
          })
        )
      );
    this.cd.detectChanges();
    } catch (error) {
       this.s.dispatch({
          type: POST_MSG,
          text: `No symptoms for ${bodyParts.join(", ")}.`,
          options: {type: "warning"}
        });
      console.log("Unable to find category for body selection:", input)
    }
  }

  onBodyPartRemove({name, value}: MICA.SelectableEl): void {
    // remove from component's state
    _.remove(this.selectedBodyParts, {name});
    // remove any symptoms already checked from global state
    const catValue = activeCategoryValue(value)(this.state);
    if (!catValue) return;
    _.each(catValue.symptoms, symptomID => {
      this.s.dispatch(deleteSymptom(
        symptomID,
        symptomDataPath(symptomID)(this.state)
      ));
    });
  }

  onCopySymptoms({direction, bodyPartSelected}: CopyFormValue, bodyPartTrigger: string): void {
    const symptomsCollection = (_sectionCats: Illness.Normalized.FormValueCategory[], bodyPart: string) => {
      const s = _.find(_sectionCats, {"categoryID": this.getCatID(bodyPart)});
      return s && s.symptoms ? _.reduce(s.symptoms, (acc, s) => {
        const value  = symptomValue(s)(this.state);
        return value ? acc.concat(value) : acc;
      }, [] as Symptom.Value[]) : [];
    }
    this.copy = this.defaultCopy;
    const sectionCats = activeSectionCatsValue(this.state);
    if (!sectionCats) return;
    const symptomsOther = symptomsCollection(sectionCats, bodyPartSelected);
    const symptomsRequest = symptomsCollection(sectionCats, bodyPartTrigger);

    /**
     * From symptom values and data
     */
    const catFromName = direction === "from" ? bodyPartSelected : bodyPartTrigger;
    const symptomsFromValue = direction === "from" ? symptomsOther : symptomsRequest;
    const catFromID = this.getCatID(catFromName);
    const catFromData = catDataDenormalized(catFromID)(this.state);
    if (!catFromData) {
      console.error("Unable to find symptoms in from copy: ", catFromID);
      return;
    }
    const symptomsFromData = catFromData.symptoms;
    const symptomsFromUncheckedPainIDs = _.map(_.filter(symptomsFromData, s => {
      return !_.find(symptomsFromValue, {"symptomID": s.symptomID});
    }), "painSwellingID");

    /**
     * Target symptom values and data
     */
    const catToName = direction === "from" ? bodyPartTrigger : bodyPartSelected;
    const symptomsToValue = direction === "from" ? symptomsRequest : symptomsOther;
    const catToData = catDataDenormalized(this.getCatID(catToName))(this.state);
    if (!catToData) {
      console.error("Unable to find symptoms in from copy: ", catToData);
      return;
    }
    const symptomsToData = catToData.symptoms;

    _.each(symptomsFromValue, sf => {
      const sfName = symptomNameFromID(sf.symptomID)(this.state);
      const {symptomFromData, symptomToData} = this.getSymptomsData(sf.symptomID, symptomsFromData, symptomsToData);

      if (!symptomToData || !symptomFromData) {
        this.s.dispatch({
          type: POST_MSG,
          text: `Unable to copy ${sfName}.`,
          options: {type: "warning"}
        });
        return;
      }

      let symptomToValue = _.find(symptomsToValue, {"symptomID": symptomToData.symptomID});

      /**
       * Insert symptom if it doesn't exist in target
       */
      if (!symptomToValue) {
        const mergedSymptomData = {
          ...symptomFromData,
          name: symptomToData.name,
          symptomID: symptomToData.symptomID
        };
        this.s.dispatch(insertSymptom(
          symptomValueFactory(mergedSymptomData, [], this.state),
          symptomDataPath(symptomToData.symptomID)(this.state)
        ));
        symptomToValue = this.getSymptomToValue(symptomsCollection, direction, bodyPartTrigger, bodyPartSelected, symptomToData);
      }

      if (!symptomToValue) {
        console.warn("Unable to pass values into target's symptom: ");
        return;
      }

      /**
       * Merge value for symptoms that should exist
       */
      const symptomFromValue = this.getSymptomFromValue(symptomsFromValue, symptomFromData.symptomID);
      if (!symptomFromValue) {
        console.error("Unable to find value for symptom from.");
        return;
      }
      this.s.dispatch(saveSymptom({
        ...symptomFromValue,
        symptomID: (symptomToValue as Symptom.Value).symptomID
      }));
    });

    /**
     * Delete symptoms which don't exist in origin
     */
    this.deleteSymptoms(symptomsFromUncheckedPainIDs, symptomsToData, symptomsToValue);
  }

  sectionNameFromID(id: string) {
    return sectionNameFromID(id)(this.state);
  }

  getCatID(id: string): string {
    return catIDFromName(id, activeSectionData(this.state).sectionID)(this.state);
  }

  private deleteSymptoms(
    symptomsFromUncheckedPainIDs: (number | undefined)[],
    symptomsToData: Symptom.Data[],
    symptomsToValue: Symptom.Value[]) {
    _.each(symptomsFromUncheckedPainIDs, painIDFrom => {
      const symptomToUncheck = _.find(symptomsToData, {"painSwellingID": painIDFrom});
      if (symptomToUncheck) {
        const symptomToUncheckID = symptomToUncheck.symptomID;
        const symptomToValue = _.find(symptomsToValue, {"symptomID": symptomToUncheckID});
        if (symptomToValue) {
          this.s.dispatch(deleteSymptom(
            symptomToUncheckID,
            symptomDataPath(symptomToValue.symptomID)(this.state)
          ));
        }
      }
    });
  }

  private getBodyParts(cats: Illness.Normalized.FormValueCategory[]): MICA.SelectableEl[]  {
    return _.reduce(cats, (result, cat) => {
      if (cat.symptoms && cat.symptoms.length) {
        const _catData = catData(cat.categoryID)(this.state);
        if (_catData) result.push({name: _catData.name, value: _catData.categoryID});
      }
      return result;
    }, [] as MICA.SelectableEl[]);
  }

  private exists = (val: any) => !!val;

  private setDefaultBodyPart(bodyPart: string) {
    this.defaultBodyPart = bodyPart;
  }

  private onActiveSectionData() {
    const cats = activeSectionCatsValue(this.state);
    this.selectedBodyParts = this.getBodyParts(cats);
    this.cd.detectChanges();
  }

  private getSymptomsData(symptomID: string, symptomsFromData: any, symptomsToData: any): any {
    const symptomFromData = _.find(symptomsFromData, {"symptomID": symptomID});
    const symptomToData = symptomFromData
      ? _.find(symptomsToData, {"painSwellingID": (symptomFromData as any).painSwellingID})
      : undefined;
    return {
      symptomFromData,
      symptomToData
    }
  }

  private getSymptomToValue(symptomsCollectionFn: any, direction: string, bodyPartTrigger: string,
                            bodyPartSelected: string, symptomToData: any): any {
    let symptomToValue;
    const sectionCatsUpdated = activeSectionCatsValue(this.state);
    if (sectionCatsUpdated) {
      const symptomsToValueUpdated = symptomsCollectionFn(sectionCatsUpdated,
        direction === "from" ? bodyPartTrigger : bodyPartSelected);
      symptomToValue = _.find(symptomsToValueUpdated, {"symptomID": symptomToData.symptomID});
    }
    return symptomToValue;
  }

  private getSymptomFromValue(symptomsFromValue: any, symptomID: string): any {
    return _.find(symptomsFromValue, {"symptomID": symptomID});
  }

  private setSvgShapes(route: ActivatedRoute) {
    const routeData = route.snapshot.data;
    const svgShapes = routeData.shapes;
    this.svgShapes = svgShapes;
  }

}


