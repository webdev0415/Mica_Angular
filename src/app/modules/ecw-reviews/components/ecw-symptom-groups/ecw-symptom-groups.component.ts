import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { select, NgRedux } from "@angular-redux/store"
import { activeEcwIllness, symptomGroupsFromActiveIllness, sectionsFromActiveIllness } from "./../../../../state/ecw/ecw.selectors";

@Component({
  selector: "ecw-symptom-groups",
  templateUrl: "./ecw-symptom-groups.component.html",
  styleUrls: ["./ecw-symptom-groups.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EcwSymptomGroupsComponent implements OnInit, OnDestroy {
  private ecwSub: Subscription;
  loadingData = false;

  symptomGroups = symptomGroupsFromActiveIllness(this.state);
  sections = sectionsFromActiveIllness(this.state);
  sgIDs: string[] = [];
  groupsComplete: string[] = [];

  @select(activeEcwIllness) meta: ECW.Illness;
  get state(): State.Root { return this.s.getState() }

  constructor(private cd: ChangeDetectorRef, private s: NgRedux<State.Root>) { }

  ngOnInit() {
    this.sgIDs = this.symptomGroups ? Object.keys(this.symptomGroups) : [];
  }

  getCategories(sectionID: string) {
    return this.sections ? this.sections[sectionID].categories : [];
  }

  getSGClass(groupID: string) {
    const completed = this.groupsComplete.some(g => g === groupID);
    return completed ? "bg-success" : "bg-warning";
  }

  ngOnDestroy() {
  }
}
