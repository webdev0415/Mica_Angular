import { symptomItemPath, symptomItemsIDs } from "./../state/nav/nav.selectors";
import { symptomGroupDataLoaded, symptomGroupData, symptomGroupVersions, catNameFromID } from "./../state/symptoms/symptoms.selectors";
import { Injectable } from "@angular/core";
import { NgRedux } from "@angular-redux/store";
import { Observable } from "rxjs";
import * as _ from "lodash";
import { postMsg } from "../state/messages/messages.actions";
import {
  setNlpSymptoms,
  setSymptomDefinition,
  setSymptomGroup
} from "../state/symptoms/symptoms.actions";
import { of } from "rxjs/observable/of";
import { merge } from "rxjs/observable/merge";
import { forkJoin } from "rxjs/observable/forkJoin";
import { map, takeWhile, tap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class SymptomService {
  private get state() {return this.s.getState()}

  constructor(private s: NgRedux<State.Root>,
              private http: HttpClient) {}

  private loadSymptomGroup(sgID: string): Observable<Workbench.SymptomGroup> {
    // const url = (sgID !== "nlp")
    //   ? _.join([this.state.global.api.symptoms.symptomGroups, symptomItemPath(sgID)(this.state) || sgID], "/")
    //   : _.join([this.state.global.api.symptoms.nlpSymptomGroups, sgID], "/");
    const url = _.join([this.state.global.api.symptoms.symptomGroups, symptomItemPath(sgID)(this.state) || sgID], "/")

    return this.http.get<Workbench.SymptomGroup>(url);
  }

  symptomGroupAll(state: State.Root): Observable<any> {
    const groupNames = symptomItemsIDs(state);
    const obs = _.map(groupNames, id => {
      const cache = symptomGroupData(id)(this.state);
      return cache ? of(cache) : this.loadSymptomGroup(id);
    });

    return merge(...obs)
      .pipe(
        takeWhile(() => !symptomGroupDataLoaded(this.state))
      );
  }

  private loadSymptomGroupAll(state: State.Root): Observable<Workbench.SymptomGroup[]> {
    let temp: any;
    const symptomGroups = state.symptoms.entities.symptomGroups;
    if (symptomGroups) {
      Object.keys(symptomGroups).forEach(key => {
        const sg = state.symptoms.entities.symptomGroups[key];
        if (sg.categories) {
          sg.categories.forEach((cat, i, arr) => {
            const name = catNameFromID(cat)(state);
            if (name.toLowerCase().includes("other")) {
              const tempOther = arr.splice(Number(i), 1);
              arr.push(tempOther[0]);
              temp = {...state};
              temp.symptoms.entities.symptomGroups[key].categories = arr;
            }
          })
        }
      })
    }
    let requests: Observable<Workbench.SymptomGroup>[];

    if (temp)
      requests = _.map(symptomItemsIDs(temp), id => this.loadSymptomGroup(id));
    else
      requests = _.map(symptomItemsIDs(state), id => this.loadSymptomGroup(id));

    return forkJoin(requests);
  }

  rehydrateSymptomGroups(force?: boolean): Observable<boolean> {
    if (!force && symptomGroupDataLoaded(this.state)) return of(true);
    return this.loadSymptomGroupAll(this.state)
      .pipe(
        map(sgs => {
          _.each(sgs, sg => {
            this.s.dispatch(setSymptomGroup(sg))
          });
          return true;
        })
      );
  }

  lazyCheckWorkbenchDataVersion(): Observable<any> {
    return this.loadSymptomGroupAll(this.state)
      .pipe(
        map(this.setSymptomGroups.bind(this)),
        tap(this.postMsg.bind(this))
      )
  }

  lazyCheckDefinitions(): Observable<Symptom.Definition[]> {
    return this.getSymptomDefinitions()
      .pipe(
        tap(defs => {
            this.s.dispatch(setSymptomDefinition(defs));
        })
      )
  }

  getSymptomDefinitions(): Observable<Symptom.Definition[]> {
    return this.http.get<Symptom.Definition[]>(this.s.getState().global.api.symptoms.definitions);
  }

  /* istanbul ignore next */
  fetchNlpSymptoms(page = 1, searchTerm = ""): Observable<any> {
    const searchPart = searchTerm ? `&name=${searchTerm}` : "";
    return this.http.get(`${this.state.global.api.nlp.symptoms}?source=nlp&size=50&page=${page}${searchPart}`)
      .pipe(
        tap(this.setNlpSymptoms.bind(this)),
      )
  }

  private setNlpSymptoms(response: {pagenumber: number, totalElements: number, content: any[]}) {
    const {pagenumber, totalElements, content} = response;
    const symptoms = this.transformNlpSymptoms(content);
    this.s.dispatch(setNlpSymptoms(symptoms, pagenumber + 1, totalElements));
  }

  private transformNlpSymptoms(nlpSymptoms: any[]) {
    return nlpSymptoms.map(symptom => {
      const {dataStoreTemplates, ...withoutDataStoreTemplates} = symptom;
      Object.assign(withoutDataStoreTemplates, {symptomsModel: {dataStoreTypes: dataStoreTemplates}});
      return withoutDataStoreTemplates;
    })
  }

  private postMsg(sgs: Workbench.SymptomGroup[]) {
    if (sgs && sgs.length) {
      this.s.dispatch(postMsg(
        "New Workbench Data Model Detected and Rehydrated",
        {type: "success"}
      ));
    }
  }

  private setSymptomGroups(sgs: Workbench.SymptomGroup[]): Workbench.SymptomGroup[] {
    const currentV = symptomGroupVersions(this.state);
    return _.filter(sgs, sg => {
      const suits = sg.updatedDate !== currentV[sg.groupID];
      if (suits) this.s.dispatch(setSymptomGroup(sg));
      return suits;
    });
  }

}

