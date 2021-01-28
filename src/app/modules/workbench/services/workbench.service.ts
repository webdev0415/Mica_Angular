import { NgRedux } from '@angular-redux/store';
import { Inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import * as _ from "lodash";
import {Observable} from "rxjs/Rx";

@Injectable()
export class WorkbenchService {
  private get state() { return this.s.getState(); }
  snomedSymp = {symptomId: String, name: String};
  constructor(private router: Router,
              private s: NgRedux<State.Root>) {
  }

  goToNextSymptomGroup(): void {
    const nav = this.state.nav;
    const nextItem = _.findIndex(nav.symptomItems, item => item.path === nav.activeGroup) + 1;
    if (nextItem < nav.symptomItems.length) {
      this.router.navigate(["workbench", nav.symptomItems[nextItem].path]);
    } else {
      this.router.navigate(["review"]);
    }
  }

  // setSelectedSnoMedSymptom(symp: any) {
  //   this.snomedSymp.symptomId = symp.symptomId;
  //   this.snomedSymp.name = symp.name;
  // }
  //
  // getSelectedSnoMedSymtom() {
  //   return this.snomedSymp;
  // }
  //
  // getSnoMedSymptoms(page: number, size: number): Observable<ECW.Response> {
  //   const url = this.state.global.api.ecw.illness;
  //
  //   return this.http.get(`${url}?source=ECW&page=${page}&size=${size}`)
  //     .map(res => res.json())
  // }
}
