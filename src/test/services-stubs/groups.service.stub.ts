/**
 * Created by sergeyyudintsev on 05.10.17.
 */
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {of} from "rxjs/observable/of";
import {Subject} from "rxjs/index";
const fakeGroups = require("../../test/data/groups.json");


@Injectable()

export class GroupsServiceStub {
  /* istanbul ignore next */
  loadGroups = new Subject<boolean>();
  /* istanbul ignore next */
  getState() {

  }
  /* istanbul ignore next */
  getAllGroups(): Observable<Groups.Group[]> {
    return of(fakeGroups)
  }

  /* istanbul ignore next */
  getSymptomsInGroup(): Observable<Groups.SymptomsInGroup> {
    const fakeSymtomsinGroups = {
      "groupID": 30,
      "symptoms": [
        {symptomID: "SYMPT0000523", groupFlag: "C"},
        {symptomID: "SYMPT0003130", groupFlag: "C"},
        {symptomID: "SYMPT0000521", groupFlag: "N"},
        {symptomID: "SYMPT0000659", groupFlag: "N"},
        {symptomID: "SYMPT0000491", groupFlag: "C"}
      ]
    };
    return of(fakeSymtomsinGroups)
  }
}
