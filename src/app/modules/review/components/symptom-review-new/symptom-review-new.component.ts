import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import * as _ from 'lodash';
import { isReviewer } from '../../../../state/user/user.selectors';
import { Subscription, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { isReadOnlyMode } from '../../../../state/task/task.selectors';
import { readOnlySymptomsInCatValue, symptomsInCatValue } from '../../../../state/workbench/workbench.selectors';
import { ecwValidationMissingSymptomsInCat } from '../../../../state/ecw/ecw.selectors';
import { symptomDataPath } from 'app/state/symptoms/symptoms.selectors';

@Component({
  selector: 'symptom-review-new',
  templateUrl: './symptom-review-new.component.html',
  styleUrls: ['./symptom-review-new.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SymptomReviewNewComponent implements OnInit, OnDestroy {
  @select(isReadOnlyMode) isReadOnlyMode: Observable<boolean>;
  @Input() readOnly = false;
  @Input() symptomGroupID: string;
  @Input() categoryID: string;
  @Input() ecwValidationSymptoms: {[idx: string]: Symptom.Value} | null;
  @Input() svgShapes: MICA.BodyImage.ViewSVGMap | null;

  isReviewer = isReviewer(this.state);
  private subs: Subscription[] = [];
  groupedSymptoms: {name: string, symptoms: Symptom.Value[]}[] = [];
  bodyPartsMap: {[id: string]: string[]} = {};

  get symptomsValue() {
    return combineLatest([
        this.s.select(this.readOnly ? readOnlySymptomsInCatValue(this.categoryID) : symptomsInCatValue(this.categoryID)),
        this.s.select(ecwValidationMissingSymptomsInCat(this.symptomGroupID, this.categoryID))
      ])
      .pipe(
        map(([a, b]) => [...a, ...b])
      );
  }

  private get state() {return this.s.getState()}

  constructor(private s: NgRedux<State.Root>,
              private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.subs.push(this.symptomsValue.subscribe(ss => {
        this.groupedSymptoms = this.getGroupedSymptoms(ss as Symptom.Value[]);
        this.cd.detectChanges();
    }));
  }

  ngOnDestroy() {
    _.each(this.subs, sub => sub.unsubscribe());
  }

  getGroupedSymptoms(ss: Symptom.Value[]) {
    const grouped: { [key: string ]: Symptom.Value[] } = {};
    const requiredSymptoms: Symptom.Value[] = [];
    const rootSymptoms: Symptom.Value[] = [];

    ss.forEach((sympt: Symptom.Value) => {
      if (sympt.isMissing) {
        requiredSymptoms.push(sympt);
        return;
      }

      if (!sympt.bodyParts) {
        rootSymptoms.push(sympt);
        return;
      }

      const key = sympt.bodyParts.join(' & ');

      if (!grouped[key]) grouped[key] = [];

      grouped[key].push(sympt);
    });

    const groupedSymptoms = Object.entries(grouped)
      .sort((a, b) => b[0].length - a[0].length)
      .map(el => ({name: el[0], symptoms: el[1]}));

    if (rootSymptoms.length) {
      groupedSymptoms.unshift({name: 'root', symptoms: rootSymptoms});
    }

    if (requiredSymptoms.length) {
      groupedSymptoms.push({name: 'Machine Learning Required Symptom', symptoms: requiredSymptoms});
    }

    return groupedSymptoms;
  }

  trackByGroupName(index: number, group: any) {
    return group.name;
  }

  trackBySymptomId(index: number, symptom: Symptom.Value) {
    return symptom.symptomID;
  }

  getBodypart(symptomID: string) {
    if (
      this.bodyPartsMap[symptomID]
      && ((this.svgShapes && this.bodyPartsMap[symptomID].length) || !this.svgShapes)
    ) {
      return this.bodyPartsMap[symptomID];
    }

    let bodyParts: string[] = [];

    if (this.svgShapes) {
      const loc: Symptom.LocationData = symptomDataPath(symptomID, this.symptomGroupID)(this.state);
      bodyParts = this.findBodyParts(this.svgShapes, loc.categoryName, loc.viewName)
    }

    return this.bodyPartsMap[symptomID] = bodyParts;
  }

  findBodyParts(shapes: MICA.BodyImage.ViewSVGMap, name: string, view?: string|null) {
    if (name === 'Whole Body') return ['Whole Body'];

    const bodyShapes = shapes[view || 'general'];
    const perspectiveShapes = bodyShapes['front'];
    let bodyParts: string[] = [];

    Object.keys(perspectiveShapes).forEach((key: string) => {
      Object.values(perspectiveShapes[key]).forEach(group => {
          if (!group.shapes) return;

          group.shapes.forEach((shape, index, arr) => {
            if (shape.name === name) {
              bodyParts = (group.groupName) ? arr.map(sh => sh.name) : [shape.name];
            }
          });
          // for group like "Arms"
          if (!bodyParts.length && group.groupName === name) bodyParts = group.shapes.map(sh => sh.name);
      })
    });

    return bodyParts;
  }

}
