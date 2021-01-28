import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { NgRedux } from "@angular-redux/store";
import { defaultState } from "../../../app.config";
import * as _ from "lodash";
import { GroupsComponent } from "./groups.component";
import { of } from "rxjs";
import * as groupsActions from "app/state/groups/groups.actions";
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import { OptionNamePipe } from "../../pipes/option-name.pipe";
import { GroupService } from "app/services/group.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";


const state = _.cloneDeep(defaultState);
const mockRedux = {
  getState: () => {
    return state
  },
  dispatch: (arg: any) => {
  }
};

@Component({
  selector: "mica-groups-search",
  template: "<div></div>",
})
class MockGroupsSearchComponent {
  @Input() size: "" | "large" = "";
  @Input() selector = false;
  @Input() searchQuery: string;
  @Input() minSearchQueryLength = 3;
  @Input() showingResults: boolean;

  @Output() record: EventEmitter<Groups.SymptomsInGroup> = new EventEmitter;
  @Output() searchQueryChanges: EventEmitter<string> = new EventEmitter();
  @Output() searchResultsExistenceChanges: EventEmitter<boolean> = new EventEmitter();
}

@Component({
  selector: "mica-groups-list",
  template: "<div></div>",
})
class MockGroupsListComponent {
  @Input() symptomsInGroupsList: Groups.SymptomsInGroup;
  @Output() deleteGroupCall: EventEmitter<number> = new EventEmitter;
  @Output() record: EventEmitter<Groups.SymptomsInGroup> = new EventEmitter;
  @Output() showingResults: EventEmitter<boolean> = new EventEmitter();
}

describe("GroupsMainComponent", () => {
  let component: GroupsComponent;
  let fixture: ComponentFixture<GroupsComponent>;
  let redux: NgRedux<State.Root>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GroupsComponent,
        OptionNamePipe,
        MockGroupsListComponent,
        MockGroupsSearchComponent
      ],
      providers: [
        GroupService,
        { provide: NgRedux, useValue: mockRedux }
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    redux = TestBed.get(NgRedux);
    fixture = TestBed.createComponent(GroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("addGroup", () => {
    const fakeGroup = { name: "name" };
    const fakeGroupAction = { type: "type" };
    const spyOnDispatch = spyOn(redux, "dispatch").and.callThrough();
    const spyOnAction = spyOn(groupsActions, "addGroup").and.returnValue(fakeGroupAction);
    const spyOnEmitNewGroup = spyOn<any>(component, "emitNewGroup").and.callFake(() => {});

    spyOn<any>(component["groupService"], "addGroup").and.returnValue(of(fakeGroup));
    component.addGroup();

    expect(spyOnAction).toHaveBeenCalledWith(fakeGroup);
    expect(spyOnDispatch).toHaveBeenCalledWith(fakeGroupAction);
    expect(spyOnEmitNewGroup).toHaveBeenCalledWith(fakeGroup);
    expect(component.searchQuery).toEqual(fakeGroup.name);
  });

  it("emitNewGroup", () => {
    const fakeGroup = { groupID: 1, name: "name" };
    const fakeSymptomsInGroup = { groupID: fakeGroup.groupID, symptoms: [] };
    const spyOnSymptomInGroupsRecord = spyOn(component, "symptomInGroupsRecord").and.callFake(() => {});

    spyOn<any>(component["groupService"], "getSymptomsInGroup").and.returnValue(of(fakeSymptomsInGroup));
    component["emitNewGroup"](fakeGroup);

    expect(spyOnSymptomInGroupsRecord).toHaveBeenCalledWith(fakeSymptomsInGroup);
  });

  it("should call deleteGroupCall", () => {
    component.deleteGroupCall(1);
    expect(component.searchQuery).toEqual("");
  });

  it("should clearSearch", () => {
    component.clearSearch();
    expect(component.searchQuery).toEqual("");
  });

  it("symptomInGroupsRecord", () => {
    const records: Groups.SymptomsInGroup = {
      groupID: 1,
      symptoms : [
        {symptomID: "SYMPT0001983", groupFlag: "C"},
        {symptomID: "SYMPT0002874", groupFlag: "C"},
        {symptomID: "SYMPT0000178", groupFlag: "C"}
        ]
    };

    component.symptomInGroupsRecord(records);
    expect(component.symptomsInGroupsList).toEqual(records);
  });

  it("buttonsDisabled", () => {
    component["lastSearchQuery"] = "";
    expect(component.buttonsDisabled).toEqual(true);

    component["lastSearchQuery"] = "a";
    expect(component.buttonsDisabled).toEqual(true);

    component["lastSearchQuery"] = "aaa";
    component["hasSearchResults"] = true;
    expect(component.buttonsDisabled).toEqual(true);

    component["lastSearchQuery"] = "aaa";
    component["addGroupProcess"] = true;
    expect(component.buttonsDisabled).toEqual(true);
  });

  it("onSearchQueryChanges", () => {
    const query = "query";

    component.onSearchQueryChanges(query);
    expect(component["lastSearchQuery"]).toEqual(query);
  });

  it("onSearchResultsExistenceChanges", () => {
    const flag = true;

    component.onSearchResultsExistenceChanges(flag);
    expect(component["hasSearchResults"]).toEqual(flag);
  });

  it("onShowingResults", () => {
    const resultShowing = true;
    component.onShowingResults(resultShowing);
    expect(component["resultShowing"]).toEqual(resultShowing);
  });

});
