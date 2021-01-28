import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import * as _ from "lodash";
import { NgRedux } from "@angular-redux/store";
import {of} from "rxjs/observable/of";
import {map, timeout} from "rxjs/operators";
import {HttpClient, HttpResponse} from "@angular/common/http";

@Injectable()
export class ApiService {
  private api: State.ApiConfig;

  constructor(private s: NgRedux<State.Root>,
              private http: HttpClient) {}

  /* istanbul ignore next */
  search(
    term: string,
    url: string,
    /* istanbul ignore next */
    queryParams = ""
  ): Observable<MICA.SelectableEl[]> {
    if (term === "") return of([]);
    url = url + term + queryParams;
    // added observer option to get actual response
    return this.http.get(url, { observe: "response", responseType: "text" })
      .pipe(
        timeout(15000),
        map(this.parseResponse),
        map(this.processSearchResult.bind(this))
    )
  }

  private parseResponse(response: HttpResponse<any>) {
    try {
      try {
        return JSON.parse(response.body);
      } catch (err) {
        return response.body;
      }
    } catch (error) {
      throw Error("Unable to parse response");
    }
  }

  private processItems(items: any) {
    return _.map(items, (i: Illness.Node) => {
      if (items.length) {
        if (i.description)
          return {name: i.description, value: i.name};
        else
          return {name: i, value: i};
      }
      return {name: items.description, value: items.name};
    });
  }

  private processSearchResult(items: any) {
    if (!items)
      return [];
    if (items["nodes"]) {
      // icd10code search
      return _.map(items.nodes, (i: Illness.Node) => {
        return { name: i.nodeName, value: i.icd10Code}
      });
    } else if (items["userData"]) {
      // remoteIllnessValue
      const illnesses: Illness.FormValue[] = items["userData"];
      return _.map(illnesses, i => ({name: i.name, value: i}));
    } else if (items[0] && items[0].sctid) {
      // snomedCode search
      return _.map(items, (item) => ({name: item.fsn, value: item.sctid}))
    } else {
      const temp = [];
      let icdSearch = false;
      for (let i = 0; i < items.length; i++) {
        temp.push({"name": items[i].name, "description": items[i].description});
        if (items[i].childNodes) {
          icdSearch = true;
          this.pushChildNodes(items[i]["childNodes"], temp);
        } else {
          break;
        }
      }
      if (icdSearch) {
        return _.map(temp, (i: Illness.Node) => {
          return { name: i.description, value: i.name}
        });
      }
    }
    return this.processItems(items);
  }

  private pushChildNodes(childNodes: any, temp: Array<any>) {
    for (let j = 0; j < childNodes.length; j++) {
      temp.push({"name": childNodes[j]["name"], "description": childNodes[j]["description"]});
      if (childNodes[j].childNodes) {
        for (let k = 0; k < childNodes[j].childNodes.length; k++) {
          temp.push({"name": childNodes[j]["childNodes"][k]["name"],
            "description": childNodes[j]["childNodes"][k]["description"]});
        }
      }
    }
  }
}
