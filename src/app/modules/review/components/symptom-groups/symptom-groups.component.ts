import { Observable } from 'rxjs/Observable';
import {
  activeIllnessValue,
  symptomGroupValue,
  isSymptomGroupComplete,
  readOnlyIllness, isReadOnlySymptomGroupComplete, readOnlySymptomGroupValue
} from 'app/state/workbench/workbench.selectors';
import { select, NgRedux } from '@angular-redux/store';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { symptomItemsIDs } from 'app/state/nav/nav.selectors';
import { ecwValidationIllness } from 'app/state/ecw/ecw.selectors';
import { normalizeIllness } from 'app/state/denormalized.model';
import { UniquenessService } from '../../services/uniqueness.service';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'review-symptom-groups',
  templateUrl: './symptom-groups.component.html',
  styleUrls: ['./symptom-groups.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SymptomGroupsComponent implements OnInit {
  @Input() readOnly = false;
  @select(['nav', 'showIllnessErrors']) showIllnessErrors: Observable<boolean>;
  @select(activeIllnessValue) activeIllnessValue: Observable<Illness.Normalized.IllnessValue | undefined>;
  @select(readOnlyIllness) readOnlyIllness: Observable<Illness.Normalized.IllnessValue | undefined>;
  isEditor: boolean;
  syncingIllness = false;
  sgIDs = symptomItemsIDs(this.state);
  isUnique = false;
  initial = false;

  private ecwValidationIllness = ecwValidationIllness(this.state);

  get ecwValidationSymptoms(): { [id: string]: Symptom.Value } | null {
    if (this.ecwValidationIllness) {
      const normalizedIllness = normalizeIllness(this.ecwValidationIllness);
      return normalizedIllness && normalizedIllness.entities && normalizedIllness.entities.symptoms || {}
    } else return null
  }

  get illnessValue(): Observable<Illness.Normalized.IllnessValue | undefined> {
    return this.readOnly ? this.readOnlyIllness : this.activeIllnessValue;
  }

  private get state() {
    return this.s.getState()
  }

  constructor(private s: NgRedux<State.Root>,
              private uniqSvc: UniquenessService,
              private cd: ChangeDetectorRef,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.isEditor = this.route.snapshot.url[0].path === 'editor';
    if (this.isEditor) {
      this.onCheckUniqueness();
    }
  }

  trackSectionByFn(index: number, value: Illness.FormValueSection) {
    return value.sectionID;
  }

  getGroupState(groupID: string): string {
    const isComplete = this.readOnly ? isReadOnlySymptomGroupComplete(groupID)(this.state) : isSymptomGroupComplete(groupID)(this.state);

    return isComplete
      ? 'COMPLETE'
      : symptomGroupValue(groupID)(this.state)
        ? 'PENDING'
        : 'NOT STARTED';
  }

  getSGClass(groupID: string): string {
    const groupState = this.getGroupState(groupID);

    switch (groupState) {
      case 'COMPLETE':
        return 'bg-success';
      case 'PENDING':
        return 'bg-warning';
      case 'NOT STARTED':
        return 'bg-danger';
      default:
        throw Error('State not recognised in group badge');
    }
  }

  sgSections(groupID: string): string[] {
    const symptomGroup = this.readOnly ? readOnlySymptomGroupValue(groupID)(this.state) : symptomGroupValue(groupID)(this.state);
    return symptomGroup && symptomGroup.sections ? symptomGroup.sections : [];
  }

  hasSections(groupID: string): boolean {
    const symptomGroup = this.readOnly ? readOnlySymptomGroupValue(groupID)(this.state) : symptomGroupValue(groupID)(this.state);
    return !!symptomGroup && !!symptomGroup.sections;
  }

  /* istanbul ignore next */
  private onCheckUniqueness() {
    const value = activeIllnessValue(this.state);

    if (!value) return;

    this.syncingIllness = true;
    this.uniqSvc.checkUniqueness(value.form.idIcd10Code, value.form.version, false)
      .pipe(
        take(1),
        finalize(this.onCheckUniquenessComplete.bind(this))
      ).subscribe(this.onCheckUniquenessResult.bind(this));
  }

  private onCheckUniquenessComplete() {
    this.syncingIllness = false;
    this.initial = false;
    this.cd.detectChanges();
  }

  private onCheckUniquenessResult(res: any) {
    if (res && !res.length) {
      this.isUnique = true;
    }
  }

}
