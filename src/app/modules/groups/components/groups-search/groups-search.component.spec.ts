import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { GroupsSearchComponent } from "./groups-search.component";
import { NgRedux } from "@angular-redux/store";
import { defaultState } from "app/app.config";
import { GroupService } from "app/services/group.service";
import { of } from "rxjs/observable/of";
import * as _ from "lodash";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import * as groupsSelectors from "app/state/groups/groups.selectors";
import { Observable, BehaviorSubject } from "rxjs";
import { Component } from "@angular/core";
import { ErrorObservable } from "rxjs/observable/ErrorObservable";


@Component({
  selector: "mica-inline-spinner",
  template: "<div></div>"
})
class MockInlineSpinnerComponent {
}

const state = _.cloneDeep(defaultState);
const mockRedux = {
  getState: () => {
    return state;
  },
  dispatch: (arg: any) => {
  }
};

describe("GroupsSearchComponent", () => {
  let component: GroupsSearchComponent;
  let fixture: ComponentFixture<GroupsSearchComponent>;
  let redux: NgRedux<State.Root>;
  let groupService: GroupService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GroupsSearchComponent,
        MockInlineSpinnerComponent
      ],
      providers: [
        GroupService,
        { provide: NgRedux, useValue: mockRedux }
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    redux = TestBed.get(NgRedux);
    groupService = TestBed.get(GroupService);
    fixture = TestBed.createComponent(GroupsSearchComponent);
    component = fixture.componentInstance;
    component.minSearchQueryLength = 3;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("ngOnInit", () => {
    const fakeSub = Observable.of(3).subscribe();

    spyOn<any>(component, "getSearchSub").and.returnValue(fakeSub);
    component.ngOnInit();
    expect(component.searchSub).toEqual(fakeSub);
  });

  it("ngOnDestroy", () => {
    const sub = of({}).subscribe();
    const unsubSpy = spyOn(sub, "unsubscribe").and.callThrough();

    component["subs"].push(sub);
    component.ngOnDestroy();

    expect(unsubSpy).toHaveBeenCalled();
  });

  it("onClose", () => {
    component.searchCtrl.setValue("test");
    component.searchTryGroup = true;
    component.onClose();
    expect(component.searchCtrl.value).toBe("");
    expect(component.searchTryGroup).toBeFalsy();
    expect(component.focusOnSearch).toBeTruthy();
  });

  it("handleClick", () => {
    const parentNode = document.createElement("div");
    const targetElem = document.createElement("div");
    const ev = {
      target: targetElem
    };

    parentNode.appendChild(targetElem);
    component.inputRef = {nativeElement: parentNode};
    component.ulRef = {nativeElement: parentNode};
    component.focusOnSearch = true;
    component.handleClick(ev);
    expect(component.focusOnSearch).toBeTruthy();
  });

  it("handleClick", () => {
    const parentNode = document.createElement("div");
    const targetElem = document.createElement("div");
    const ev = {
      target: targetElem
    };

    parentNode.appendChild(targetElem);
    component.inputRef = {nativeElement: parentNode};
    component.ulRef = {nativeElement: targetElem};
    component.focusOnSearch = true;
    component.handleClick(ev);
    expect(component.focusOnSearch).toBeFalsy();
  });

  it("setSearchResults", () => {
    const nextSpy = spyOn(component.searchResults, "next").and.callThrough();
    const errorThrown = true;

    component["setSearchResults"](errorThrown, []);
    expect(nextSpy).toHaveBeenCalledWith([]);
  });

  it("state", () => {
    const s = {};

    spyOn(redux, "getState").and.returnValue(s);
    expect(component["state"]).toEqual(s as any);
  });

  xit("onSearchCtrlChange without term", () => {
    const term = null;
    const nextSpy = spyOn(component.searchResults, "next").and.callThrough();
    const onSearchSpy = spyOn(component, "onSearch").and.callFake(() => {});

    spyOn(groupsSelectors, "findGroupsLive").and.returnValue(() => {
      return [{
        name: "one",
        groupID: 1
      }];
    });
    component["onSearchCtrlChange"](term);
    expect(onSearchSpy).toBeUndefined();
    expect(nextSpy).toHaveBeenCalledWith([]);
  });

  it("onSearchCtrlChange with term", () => {
    const term = "one";
    const nextSpy = spyOn(component.searchResults, "next").and.callThrough();

    spyOn(groupsSelectors, "findGroupsLive").and.returnValue(() => {
      return [{
        name: "one",
        groupID: 1
      },
      {
        name: "two",
        groupID: 2
      }];
    });
    component.focusOnSearch = false;
    component["onSearchCtrlChange"](term);
    expect(component.focusOnSearch).toBeTruthy();
    expect(nextSpy).toHaveBeenCalled();
  });

  it("ngOnChnages with Value ", () => {
    component.searchCtrl.setValue("");
    const currentValue = "ROS";
    const changes = { searchQuery: { currentValue }};
    const setValueSpy = spyOn(component.searchCtrl, "setValue").and.callThrough();
    component.ngOnChanges(<any>changes);

    expect(setValueSpy).toHaveBeenCalled();
  });

  it("ngOnChnages withOut Value ", () => {
    component.searchCtrl.setValue("");
    const changes = {};
    const setValueSpy = spyOn(component.searchCtrl, "setValue").and.callThrough();
    component.ngOnChanges(<any>changes);

    expect(setValueSpy).not.toHaveBeenCalled();
  });

  it("onSearchByIcon with one result", () => {
    const onSearchSyp = spyOn(component, "onSearch").and.callFake(() => {});
    component["searchResults"] = new BehaviorSubject([{ name: "one", groupID: 1} as any]);
    component["onSearchByIcon"]();
    expect(component["searchResults"].getValue().length).toBeTruthy();
    expect(onSearchSyp).toHaveBeenCalled();
  });

  it("onSearchByIcon after clickOut", () => {
    const searchResults: any = [{ name: "one", groupID: 1 }, { name: "two", groupID: 2 }];
    const onSearchSyp = spyOn(component, "onSearch");
    component["minSearchQueryLength"] = 3;
    component["searchResults"] = new BehaviorSubject(searchResults);
    component.searchCtrl.setValue("one");
    component["onSearchByIcon"]();
    expect(onSearchSyp).not.toHaveBeenCalled();
  });

  it("onSearchByIcon withOut result", () => {
    const onSearchSyp = spyOn(component, "onSearch").and.callFake(() => {});
    component["searchResults"] = new BehaviorSubject([]);
    component["onSearchByIcon"]();
    expect(component["searchResults"].getValue().length).toBeFalsy();
    expect(onSearchSyp).not.toHaveBeenCalled();
  });

  it("onSearch with 0", () => {
    const mockGetSymptomsInGroup = spyOn<any>(component["groupService"], "getSymptomsInGroup").and.callThrough();
    component["searchResults"] = new BehaviorSubject([{ name: "one", value: 1} as any]);
    component.onSearch(0);
    expect(mockGetSymptomsInGroup).not.toHaveBeenCalled();
    expect(component.searchResults.value.length).toBeTruthy();
  });

  it("onSearch not matching", () => {
    const mockGetSymptomsInGroup = spyOn<any>(component["groupService"], "getSymptomsInGroup").and.callThrough();
    component["searchResults"] = new BehaviorSubject([{ name: "one", value: 2} as any]);
    component.onSearch(1);
    expect(mockGetSymptomsInGroup).not.toHaveBeenCalled();
    expect(component.noRecordFound).toBeTruthy();
    expect(component.searching).toBeFalsy();
  });

  it("onSearch with value", () => {
    const symptomsInGroup: Groups.SymptomsInGroup = {
      groupID: 1,
      symptoms: [
        { symptomID: "SYMPT0000523", groupFlag: "C" },
        { symptomID: "SYMPT0003130", groupFlag: "C" }, ]
    };
    component["searchResults"] = new BehaviorSubject([{ name: "one", value: 1 } as any]);
    const mockGetSymptomsInGroup = spyOn(groupService, "getSymptomsInGroup").and.returnValue(of(symptomsInGroup));
    component.onSearch(symptomsInGroup.groupID);
    expect(mockGetSymptomsInGroup).toHaveBeenCalled();
    expect(component.searchResults.value.length).toBeTruthy();
  });

  it("onSearch with error", () => {
    const error: any = {
      message: "Error message.",
      status: 404
    };
    spyOn(groupService, "getSymptomsInGroup").and.returnValue(ErrorObservable.create(error));
    component["searchResults"] = new BehaviorSubject([{ name: "one", value: 1 } as any]);

    component.onSearch(1);
    groupService["getSymptomsInGroup"](1).subscribe(null, err => {
      expect(component.noRecordFound).toEqual(true);
    });
  });

  it("onSearch with error", () => {
    const error: any = {
      message: "Error message.",
      status: 500
    };

    spyOn(groupService, "getSymptomsInGroup").and.returnValue(ErrorObservable.create(error));
    component["searchResults"] = new BehaviorSubject([{ name: "one", value: 1 } as any]);

    component.onSearch(1);
    groupService["getSymptomsInGroup"](1).subscribe(null, err => {
      expect(component.hasBackendError).toEqual(true);
    });
  });
});
