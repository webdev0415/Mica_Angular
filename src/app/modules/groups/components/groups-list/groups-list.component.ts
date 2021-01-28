import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
  Output
} from "@angular/core";
import { NgRedux } from "@angular-redux/store";
import * as _ from "lodash";
import { allGroupsSelector } from "app/state/groups/groups.selectors";
import { GroupService } from "app/services/group.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ModalComponent } from "app/modules/gui-widgets/components/modal/modal.component";
import { postMsg } from "app/state/messages/messages.actions";
import { deleteGroup, setGroups } from "app/state/groups/groups.actions";
import { take } from "rxjs/operators";
import { entities as symptomEntitiesSelector } from "app/state/symptoms/symptoms.selectors";


@Component({
  selector: "mica-groups-list",
  templateUrl: "./groups-list.component.html",
  styleUrls: ["./groups-list.component.sass"]
})
export class GroupsListComponent implements OnChanges {
  @Input() symptomsInGroupsList: Groups.SymptomsInGroup;

  @Output() deleteGroupCall: EventEmitter<number> = new EventEmitter;
  @Output() record: EventEmitter<Groups.SymptomsInGroup> = new EventEmitter;
  @Output() showingResults: EventEmitter<boolean> = new EventEmitter();

  showResults: any;
  validItemToAdd: boolean;
  allGroupList: MICA.SelectableEl[];
  allSymptomList: MICA.SelectableEl[];
  selectedSymptomToAdd: MICA.SelectableEl;
  addingSymptomProcess: boolean;
  searchQuery: string;
  page = 1;
  pageSize = 10;
  loading = false;
  sortBy = "asc";
  addingSymptoms = false;

  private fullSymptomsData: { [id: string]: Symptom.Data };

  constructor(private s: NgRedux<State.Root>,
              private groupService: GroupService,
              private modalService: NgbModal) { }

  private get state() {
    return this.s.getState();
  }

  private get symptoms() {
    return this.state.symptoms.entities.symptoms;
  }

  get allGroups(): Groups.Group[] {
    if (this.sortBy === "asc") {
      return _.orderBy(this.state.groups.groups, ["name"], ["asc"]);
    } else if (this.sortBy === "desc") {
      return _.orderBy((this.state.groups.groups), ["name"], ["desc"])
    } else {
      return this.state.groups.groups;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.symptomsInGroupsList && this.symptomsInGroupsList) {
      this.s.dispatch(setGroups(this.allGroups));
      this.fullSymptomsData || this.setFullSymptomsData();
      this.updateAllSymptomList();
      this.showResults = true;
      this.showingResults.emit(true);
    } else {
      this.showResults = false;
      this.showingResults.emit(false);
    }
  }

  clearFromView() {
    this.showResults = false;
    this.showingResults.emit(false);
    this.addingSymptoms = false;
    this.groupService.searchBarClear.next(true);
  }

  viewGroup(group: Groups.Group) {
    this.loading = true;
    this.groupService.getSymptomsInGroup(group.groupID)
      .subscribe(record => {
        this.loading = false;
        this.record.emit(record);
      });
  }

  onSelectValue(result: MICA.SelectableEl) {
    const valueExists = this.symptomsInGroupsList.symptoms.find(x => x.symptomID === result.value);
    this.validItemToAdd = !valueExists;
    this.selectedSymptomToAdd = result;
    this.searchQuery = result.name;
  }

  showAddSymptoms(value: boolean) {
    this.addingSymptoms = !value;
  }

  addSymptomsItem() {
    this.addingSymptomProcess = true;
    this.symptomsInGroupsList.symptoms.push({symptomID: this.selectedSymptomToAdd.value, groupFlag: "N"});
    this.updateAllSymptomList();
    this.groupService.updateSymptomsInGroup(this.symptomsInGroupsList).pipe(take(1)).subscribe(() => {
      this.searchQuery = "";
      this.validItemToAdd = false;
      this.s.dispatch(postMsg(
        `${this.selectedSymptomToAdd.value} symptom added successfully.`,
        { type: "success" }
      ));
      this.addingSymptomProcess = false;
    })
  }

  removeSymptomsItem(value: string) {
    const modalRef = this.modalService.open(ModalComponent, {size: "lg"});
    modalRef.componentInstance.data = {
      title: "Are you sure?",
      body: `Are you sure you want to delete the symptom?`,
      actionTxt: `Yes`,
      actionName: "skip",
      cancelTxt: `Cancel`
    };

    modalRef.result
      .then(() => {
        this.symptomsInGroupsList.symptoms = _.filter(this.symptomsInGroupsList.symptoms, item => item.symptomID !== value);
        this.groupService.updateSymptomsInGroup(this.symptomsInGroupsList).subscribe(() => {
          this.s.dispatch(postMsg(
            `${value} symptom removed successfully.`,
            {type: "success"}
          ));
        });
      })
      .catch(this.onModalRefResultError);
  }

  removeGroup(groupID: number) {
    const matchingGroup: any  = _.find(this.allGroupList, ["value", groupID]);
    const modalRef = this.modalService.open(ModalComponent, {size: "lg"});

    modalRef.componentInstance.data = {
      title: "Are you sure want to delete?",
      body: `You are about to delete ${matchingGroup.name} along with its associated symptoms`,
      actionTxt: `Yes`,
      actionName: "skip",
      cancelTxt: `Cancel`
    };

    modalRef.result
      .then(() => {
        this.groupService.deleteGroup(groupID).subscribe( () => {
          this.s.dispatch(deleteGroup(groupID));
          this.deleteGroupCall.emit(groupID);
          this.showResults = false;
          this.showingResults.emit(false);
          this.s.dispatch(postMsg(
            `${matchingGroup.name} group removed successfully.`,
            {type: "success"}
          ));
        });
      })
      .catch(this.onModalRefResultError);

  }

  private setFullSymptomsData() {
    this.fullSymptomsData = symptomEntitiesSelector(this.state).symptoms;
  }

  updateAllSymptomList() {
    this.allGroupList = allGroupsSelector(this.state).map(
      (obj: Groups.Group) => ({ name: obj.name, value: obj.groupID })
    );
    this.allSymptomList = this.symptomsInGroupsList.symptoms.map(
      (obj: any) => {
        const { symptomID, groupFlag } = obj;
        const symptomData = this.fullSymptomsData[symptomID];

        return {
          name: symptomData.name,
          value: { symptomID, groupFlag }
        };
      }
    );
  }

  toggleGroupFlag(symptomIndex: number) {
    const symptomToModify: any = this.symptomsInGroupsList.symptoms[symptomIndex];

    if ( symptomToModify.groupFlag === "N" ) {
      this.symptomsInGroupsList.symptoms[symptomIndex].groupFlag = "C";
    } else if ( symptomToModify.groupFlag === "C" ) {
      this.symptomsInGroupsList.symptoms[symptomIndex].groupFlag = "N";
    } else {
      this.s.dispatch(postMsg(
        `Group flag '${symptomToModify.groupFlag}' can't be toggled.`,
        { type: "warning" }
      ));
      return;
    }

    this.groupService.updateSymptomsInGroup(this.symptomsInGroupsList).subscribe(() => {
      this.s.dispatch(postMsg(
        `${symptomToModify.symptomID} updated.`,
        { type: "success" }
      ));
    });
  }

  /* istanbul ignore next */
  private onModalRefResultError (reason: string)  {
    if (reason !== "Cross click" || reason !== "cancel" as string) {
      console.error("Modal error: ", reason);
    }
  }


}
