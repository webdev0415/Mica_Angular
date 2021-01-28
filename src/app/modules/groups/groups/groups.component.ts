import { Component, Output, EventEmitter } from "@angular/core";
import { GroupService } from "app/services/group.service";
import { addGroup } from "app/state/groups/groups.actions";
import { NgRedux } from "@angular-redux/store";
import { catchError, finalize, take } from "rxjs/operators";
import { postMsg } from "app/state/messages/messages.actions";

@Component({
  selector: "mica-groups",
  templateUrl: "./groups.component.html",
  styleUrls: ["./groups.component.sass"]
})
export class GroupsComponent {
  @Output() record: EventEmitter<Groups.SymptomsInGroup> = new EventEmitter;
  symptomsInGroupsList: Groups.SymptomsInGroup;
  searchQuery: string | null;
  readonly minSearchQueryLength = 3;
  resultShowing: boolean;

  private lastSearchQuery: string;
  private hasSearchResults: boolean;
  private loading: boolean;
  private addGroupProcess: boolean;

  constructor(private groupService: GroupService,
              private s: NgRedux<State.Root>) {
  }

  get buttonsDisabled(): boolean {
    return !this.lastSearchQuery ||
            this.hasSearchResults ||
            this.addGroupProcess ||
            (this.lastSearchQuery.length < this.minSearchQueryLength);
  }

  addGroup() {
    this.addGroupProcess = true;
    const newGroupData = { groupID: 0, name: this.lastSearchQuery };

    this.groupService.addGroup(newGroupData).pipe(
      take(1)
    ).subscribe( (res: Groups.Group) => {
      this.emitNewGroup(res);
      this.searchQuery = res.name;
      this.s.dispatch(addGroup(res));
      this.s.dispatch(postMsg(
        `${res.name} group added successfully.`,
        {type: "success"}
      ));
      this.addGroupProcess = false;
    })
  }

  deleteGroupCall(groupID: number) {
    this.searchQuery = "";
    setTimeout((() => {
          this.searchQuery = null;
    }).bind(this), 100);
  }

  clearSearch() {
    this.searchQuery = "";
  }

  onShowingResults(event: boolean) {
    this.resultShowing = event
  }

  onSearchQueryChanges(q: string) {
    this.lastSearchQuery = q;
  }

  onSearchResultsExistenceChanges(flag: boolean) {
    this.hasSearchResults = flag;
  }

  symptomInGroupsRecord(event: Groups.SymptomsInGroup) {
    this.symptomsInGroupsList = event;
  }

  private emitNewGroup(groupToEmit: Groups.Group) {
    this.groupService.getSymptomsInGroup(groupToEmit.groupID)
      .pipe(
        take(1),
        catchError(error => {
          throw new Error(error);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(record => {
        this.symptomInGroupsRecord(record);
        this.record.emit(record);
      });
  }
}
