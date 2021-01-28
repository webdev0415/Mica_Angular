import { Observable, Subscription } from 'rxjs';
import {
  symptomGroupCatValue,
  sectionCatsValue,
  readOnlySectionCatsValue,
  readOnlySymptomGroupCatValue
} from '../../../../state/workbench/workbench.selectors';
import { catNameFromID, sectionNameFromID } from '../../../../state/symptoms/symptoms.selectors';
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import * as _ from 'lodash';
import { ecwValidationIllness } from '../../../../state/ecw/ecw.selectors';
import { normalize } from 'normalizr';
import { symptomGroupSchema } from '../../../../state/denormalized.model';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { filter, map, first } from 'rxjs/operators';
import { SvgShapesService } from 'app/services/svgShapes.service';

@Component({
  selector: 'review-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryListComponent implements OnInit, OnDestroy {
  @Input() readOnly = false;
  @Input() symptomGroupID: string;
  @Input() sectionID: string;
  @Input() ecwValidationSymptoms: { [id: string]: Symptom.Value } | null;

  get sectionName() { return sectionNameFromID(this.sectionID)(this.state) }
  private get state() {return this.s.getState()}
  subs: Subscription[] = [];
  catsValue: Observable<Illness.Normalized.FormValueCategory[]>;
  svgShapes: MICA.BodyImage.ViewSVGMap | null;

  constructor(private s: NgRedux<State.Root>,
              private svg: SvgShapesService,
              private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.catsValue = combineLatest([
      this.getCategories(),
      this.getEntityCategories()
    ])
      .pipe(
         map(([a, b]) => {
          if (!a) a = [];
          if (!b) b = [];
          return _.unionBy([...a, ...b], 'categoryID')
         }),
         filter(cats => !!cats),
         map(cats => cats
          .filter(cat => cat && cat.symptoms && cat.symptoms.length)
          .sort((cat1, cat2) => {
           return cat1.categoryID > cat2.categoryID ? 1 : -1
          }))
      ) as Observable<Illness.Normalized.FormValueCategory[]>;

    this.subs.push(this.svg.getShapesByGroup(this.symptomGroupID)
      .pipe(first())
      .subscribe(res => {
        this.svgShapes = res as MICA.BodyImage.ViewSVGMap;
        this.cd.detectChanges();
      }))
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  trackByFn(index: number, value: Illness.FormValueCategory) {
    return value.categoryID;
  }

  getCatName(catV: Illness.FormValueCategory): string {
    return catNameFromID(catV.categoryID)(this.state);
  }

  private getCategories() {
    if (this.readOnly) {
      return this.s.select(this.sectionID ? readOnlySectionCatsValue(this.sectionID) : readOnlySymptomGroupCatValue(this.symptomGroupID));
    } else {
      return this.s.select(this.sectionID ? sectionCatsValue(this.sectionID) : symptomGroupCatValue(this.symptomGroupID));
    }
  }

  private getEntityCategories() {
    return this.s.select(ecwValidationIllness)
      .pipe(
        map(ill => {
          const sgs = ill && ill.symptomGroups;
          const foundGroup = sgs && sgs.length ? _.find(sgs, {groupID: this.symptomGroupID}) : null;
          return foundGroup && normalize(foundGroup, symptomGroupSchema)
        }),
        map(ill => {
          return ill && _.toArray(ill.entities.categories)
        })
      )
  }

}
