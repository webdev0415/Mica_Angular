import { TestBed } from "@angular/core/testing";
import { NgRedux } from "@angular-redux/store";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { GroupService } from "./group.service";
import * as _ from "lodash";
import { defaultState } from "../app.config";

const state = _.cloneDeep(defaultState);

const mockRedux = {
  getState: () => state,
  dispatch: () => {
  }
};

describe("GroupService", () => {
  let service: GroupService;
  let mockBackend: HttpTestingController;
  let redux: NgRedux<State.Root>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GroupService,
        { provide: NgRedux, useValue: mockRedux },
      ],
      imports: [HttpClientTestingModule]
    });

    service = TestBed.get(GroupService);
    mockBackend = TestBed.get(HttpTestingController);
    redux = TestBed.get(NgRedux);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("state", () => {
    expect(service["state"]).toEqual(state);
  });

  it("getAllGroups", () => {
    const groups = [
      { name: "one", groupID: 1 },
    ];

    service.getAllGroups().subscribe(res => expect(res).toEqual(groups));
    mockBackend.expectOne(() => true).flush(groups);
    mockBackend.verify();
  });

  it("should add new group", () => {
    const newGroupData = {name: "group new", groupID: 0};
    service.addGroup(newGroupData).subscribe( res => expect(res).toEqual(newGroupData));
    mockBackend.expectOne( () => true).flush(newGroupData);
    mockBackend.verify();
  });

  it("getSymptomsInGroup", () => {
    const response: Groups.SymptomsInGroup = {
      groupID: 1,
      symptoms: [
        { symptomID: "SYMPT0000523", groupFlag: "C" },
        { symptomID: "SYMPT0003130", groupFlag: "C" }]
    };

    service.getSymptomsInGroup(1).subscribe( res => expect(res).toEqual(response));
    mockBackend.expectOne( () => true).flush(response);
    mockBackend.verify();
  });

  it("should deleteGroup", () => {
    const url = state.global.api.symptomGroups.delete;
    const groupId = 1;
    const result = "OK";

    service.deleteGroup(groupId).subscribe(res => expect(res).toEqual(result));
    mockBackend.expectOne(req => req.url === `${url}${groupId}`).flush(result);
    mockBackend.verify();
  });

  it("should updateSymptomsInGroup", () => {
    const inputValues: Groups.SymptomsInGroup = {
      groupID: 1,
      symptoms: [
        { symptomID: "SYMPT0000523", groupFlag: "C" },
        { symptomID: "SYMPT0003130", groupFlag: "C" }]
    };
    const result = "OK";

    service.updateSymptomsInGroup(inputValues).subscribe(res => expect(res).toEqual(result));
    mockBackend.expectOne( req => req.body.groupID === inputValues.groupID).flush(result);
    mockBackend.verify();
  });


});
