import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import * as _ from "lodash";
import { NgRedux } from "@angular-redux/store";
import { map } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

interface CancerValues {
  idCancer: number;
  name: string;
}

interface CancerList {
  cancerList: CancerValues[];
}

@Injectable()
export class ApiService {
  private api: State.ApiConfig;

  constructor(private s: NgRedux<State.Root>,
              private http: HttpClient) {
  }

  typeAheadValues$(name: string, url: string): Observable<MICA.SelectableEl[]> {
    return this.http.get(url)
      .pipe(
        map((list: any) => {
          if (list.cancerList) {
            return _.map((<CancerList>list).cancerList, item => {
              return {
                name: item.name,
                // value: item.idCancer.toString()
                value: item.name
              };
            });
          } else {
            return list;
          }
        })
    )
  }
}
