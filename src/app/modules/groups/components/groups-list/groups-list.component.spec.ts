import { async, ComponentFixture, TestBed, tick, fakeAsync } from "@angular/core/testing";
import { GroupsListComponent } from "./groups-list.component";
import { OptionNamePipe } from "app/modules/pipes/option-name.pipe";
import { FormsModule } from "@angular/forms";
import { Input, Component } from "@angular/core";
import { NgRedux } from "@angular-redux/store";
import { defaultState } from "app/app.config";
import * as _ from "lodash";
import { of } from "rxjs/observable/of";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import * as groupsSelectors from "app/state/groups/groups.selectors";
import * as symptomsSelectors from "app/state/symptoms/symptoms.selectors";
import * as groupActions from "app/state/groups/groups.actions";
import { GroupService } from "../../../../services";
import { NgbModule, NgbPaginationModule } from "@ng-bootstrap/ng-bootstrap";
import { GroupSortPipe } from "../../../pipes/group-sort.pipe";
import { ModalComponent } from "../../../gui-widgets/components/modal/modal.component";

@Component({
  selector: "mica-template-search",
  template: "<div></div>"
})
class MockTemplateSearchComponent {
  @Input() clearSearchOnSelect = true;
  @Input() searchQuery: string;
}

@Component({
  selector: "mica-page-spinner",
  template: "<div></div>"
})
class MockPageSpinnerComponent {
}

const state = _.cloneDeep(defaultState);
const mockRedux = {
  getState: () => {
    return state
  },
  select: (selector: any) => of(selector(defaultState)),
  dispatch: (arg: any) => {
  }
};

describe("GroupsListComponent", () => {
  let component: GroupsListComponent;
  let fixture: ComponentFixture<GroupsListComponent>;
  let redux: NgRedux<State.Root>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GroupsListComponent,
        OptionNamePipe,
        GroupSortPipe,
        MockTemplateSearchComponent,
        MockPageSpinnerComponent,
        ModalComponent
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        GroupService
      ],
      imports: [
        FormsModule,
        HttpClientTestingModule,
        NgbPaginationModule,
        NgbModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupsListComponent);
    component = fixture.componentInstance;
    redux = TestBed.get(NgRedux);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("state", () => {
    const s = {};
    spyOn(redux, "getState").and.returnValue(s);
    expect(component["state"]).toEqual(s as any);
  });

  it("ngOnChanges: symptomsInGroupsList has value", () => {
    const changes = {
      symptomsInGroupsList: {}
    };
    const updateAllSymptomList = spyOn(component, "updateAllSymptomList").and.callFake(() => {});

    component.symptomsInGroupsList = <any>{};
    component.ngOnChanges(<any>changes);
    expect(updateAllSymptomList).toHaveBeenCalled();
    expect(component["showResults"]).toEqual(true);
  });

  it("ngOnChanges: symptomsInGroupsList is empty", () => {
    const changes = {
      symptomsInGroupsList: {}
    };
    const updateAllSymptomList = spyOn(component, "updateAllSymptomList").and.callFake(() => {});

    component.ngOnChanges(<any>changes);
    expect(updateAllSymptomList).not.toHaveBeenCalled();
    expect(component["showResults"]).toEqual(false);
  });


  it("updateAllSymptomList", () => {
    const groups = [{ name: "one", groupID: 1 }];
    const records = [{ name: "one", symptomID: "SYMPT0001983" }];

    spyOn(groupsSelectors, "allGroupsSelector").and.returnValue(groups);
    spyOn(symptomsSelectors, "symptomDataMany").and.returnValue(() => records);

    component.symptomsInGroupsList = <any>{ symptoms: [] };
    component.updateAllSymptomList();

    expect(component.allGroupList[0].value).toEqual(groups[0].groupID);
   // expect(component.allSymptomList[0].value.symptomID).toEqual(records[0].symptomID);
  });

  it("onSelectValue", () => {
    const record: MICA.SelectableEl = { name: "one", value: {
        sypmtomID: "SYMPT0001983",
        groupFlag: "C"
      } };

    component.symptomsInGroupsList = { groupID: 1, symptoms : [
        {
          symptomID: "SYMPT0001983",
          groupFlag: "C"
        },
        {
          symptomID: "SYMPT0002874",
          groupFlag: "C"
        },
        {
          symptomID: "SYMPT0000178",
          groupFlag: "C"
        }
        ]};
    component.onSelectValue(record);

    expect(component.validItemToAdd).toEqual(true);
    expect(component.selectedSymptomToAdd).toEqual(record);
    expect(component.searchQuery).toEqual(record.name);
  });

  it("allGroups (sortBy ascending)", () => {
    const groups = [
      { name: "b", groupID: 2 },
      { name: "a", groupID: 1 },
    ];

    spyOn(redux, "getState").and.returnValue({ ...state, groups: { ...state.groups, groups } });
    component.sortBy = "asc";
    expect(component.allGroups[0].name).toEqual(groups[1].name);
  });

  it("allGroups (sortBy descending)", () => {
    const groups = [
      { name: "a", groupID: 1 },
      { name: "b", groupID: 2 },
    ];

    spyOn(redux, "getState").and.returnValue({ ...state, groups: { ...state.groups, groups } });
    component.sortBy = "desc";
    expect(component.allGroups[0].name).toEqual(groups[1].name);
  });

  it("allGroups (sortBy unset)", () => {
    const groups = [
      { name: "b", groupID: 2 },
      { name: "a", groupID: 1 },
    ];

    spyOn(redux, "getState").and.returnValue({ ...state, groups: { ...state.groups, groups } });
    component.sortBy = "unset";
    expect(component.allGroups[0].name).toEqual(groups[0].name);
  });

  it("symptoms getter", () => {
    expect((<any>component).symptoms).toEqual(state.symptoms.entities.symptoms);
  });

  it("clearFromView", () => {
    const showingResultsEmitSpy = spyOn(component.showingResults, "emit").and.callThrough();
    const searchBarClearSpy = spyOn((<any>component).groupService.searchBarClear, "next").and.callThrough();

    component.clearFromView();
    expect(component.showResults).toEqual(false);
    expect(component.addingSymptoms).toEqual(false);
    expect(showingResultsEmitSpy).toHaveBeenCalledWith(false);
    expect(searchBarClearSpy).toHaveBeenCalledWith(true);
  });

  it("viewGroup should load a group", fakeAsync(() => {
    const group = { name: "a", groupID: 1 };
    const groupData = { groupID: 1, symptoms: [] };
    const recordEmitSpy = spyOn(component.record, "emit").and.callThrough();

    spyOn((<any>component).groupService, "getSymptomsInGroup").and.returnValue(of(groupData));
    expect(component.loading).toEqual(false);
    component.viewGroup(group);
    tick();
    expect(component.loading).toEqual(false);
    expect(recordEmitSpy).toHaveBeenCalledWith(groupData);
  }));

  it ("showAddSymptoms", () => {
    component.showAddSymptoms(true);
    expect(component.addingSymptoms).toEqual(false);
    component.showAddSymptoms(false);
    expect(component.addingSymptoms).toEqual(true);
  });

  it ("addSymptomsItem", fakeAsync(() => {
    const updateAllSymptomListSpy = spyOn(component, "updateAllSymptomList").and.callFake(() => {});
    const updateSymptomsInGroupSpy = spyOn((<any>component).groupService, "updateSymptomsInGroup");
    const group = {
      groupID: 1,
      symptoms: []
    };

    component.selectedSymptomToAdd = {
      name: "name",
      value: "value"
    };
    component.symptomsInGroupsList = group;
    component.searchQuery = "some query";
    component.validItemToAdd = true;

    updateSymptomsInGroupSpy.and.returnValue(of());
    component.addSymptomsItem();
    tick();
    expect(updateAllSymptomListSpy).toHaveBeenCalled();
    expect(updateSymptomsInGroupSpy).toHaveBeenCalled();
    expect(component.searchQuery).not.toEqual("");
    expect(component.validItemToAdd).not.toEqual(false);

    updateSymptomsInGroupSpy.and.returnValue(of(1));
    updateAllSymptomListSpy.calls.reset();
    updateSymptomsInGroupSpy.calls.reset();
    component.addSymptomsItem();
    tick();
    expect(updateAllSymptomListSpy).toHaveBeenCalled();
    expect(updateSymptomsInGroupSpy).toHaveBeenCalled();
    expect(component.searchQuery).toEqual("");
    expect(component.validItemToAdd).toEqual(false);
  }));

  it("removeSymptomsItem", fakeAsync(() => {
    const value = "value";
    const openModalSpy = spyOn((<any>component).modalService, "open").and.returnValue({ result: Promise.resolve(), componentInstance: {} });
    const updateSymptomsInGroupSpy = spyOn((<any>component).groupService, "updateSymptomsInGroup").and.callFake(() => of(1));
    const dispatchSpy = spyOn((<any>component).s, "dispatch").and.callThrough();

    component.symptomsInGroupsList = {
      groupID: 0,
      symptoms: [
        { symptomID: value, groupFlag: "A" }
      ]
    };
    component.removeSymptomsItem(value);
    tick();
    expect(openModalSpy).toHaveBeenCalled();
    expect(updateSymptomsInGroupSpy).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalled();
    expect(component.symptomsInGroupsList.symptoms.length).toEqual(0);
  }));

  it("removeGroup", fakeAsync(() => {
    const group = { name: "A", value: 0 };
    const openModalSpy = spyOn((<any>component).modalService, "open").and.returnValue({ result: Promise.resolve(), componentInstance: {} });
    const deleteGroupSpy = spyOn((<any>component).groupService, "deleteGroup").and.callFake(() => of(1));
    const dispatchSpy = spyOn((<any>component).s, "dispatch").and.callThrough();
    const deleteGroupActionSpy = spyOn(groupActions, "deleteGroup").and.callThrough();
    const deleteGroupCallEmitSpy = spyOn(component.deleteGroupCall, "emit").and.callThrough();
    const showingResultsEmitSpy = spyOn(component.showingResults, "emit").and.callThrough();

    component.allGroupList = [group];
    component.removeGroup(group.value);
    tick();
    expect(openModalSpy).toHaveBeenCalled();
    expect(deleteGroupSpy).toHaveBeenCalled();
    expect(deleteGroupActionSpy).toHaveBeenCalledWith(group.value);
    expect(dispatchSpy).toHaveBeenCalled();
    expect(deleteGroupCallEmitSpy).toHaveBeenCalledWith(group.value);
    expect(showingResultsEmitSpy).toHaveBeenCalledWith(false);
    expect(component.showResults).toEqual(false);
  }));

  it("setFullSymptomsData", () => {
    const fakeData = { symptoms: {} };
    const symptomEntitiesSelectorSpy = spyOn(symptomsSelectors, "entities").and.returnValue(fakeData);

    (<any>component).setFullSymptomsData();
    expect(symptomEntitiesSelectorSpy).toHaveBeenCalled();
    expect((<any>component).fullSymptomsData).toEqual(fakeData.symptoms);
  });

  it("toggleGroupFlag", fakeAsync(() => {
    const fakeSymptom = {
      groupFlag: "C",
      symptomID: "someID"
    };
    const updateSymptomsInGroupSpy = spyOn((<any>component).groupService, "updateSymptomsInGroup").and.returnValue(of(1));
    const dispatchSpy = spyOn((<any>component).s, "dispatch").and.callThrough();

    component.symptomsInGroupsList = { groupID: 0, symptoms: [fakeSymptom] };
    component.toggleGroupFlag(0);
    tick();
    expect(fakeSymptom.groupFlag).toEqual("N");
    expect(updateSymptomsInGroupSpy).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalled();

    updateSymptomsInGroupSpy.calls.reset();
    dispatchSpy.calls.reset();
    component.toggleGroupFlag(0);
    tick();
    expect(fakeSymptom.groupFlag).toEqual("C");
    expect(updateSymptomsInGroupSpy).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalled();

    fakeSymptom.groupFlag = "D";
    updateSymptomsInGroupSpy.calls.reset();
    dispatchSpy.calls.reset();
    component.toggleGroupFlag(0);
    tick();
    expect(fakeSymptom.groupFlag).toEqual("D");
    expect(updateSymptomsInGroupSpy).not.toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalled();
  }));
});
