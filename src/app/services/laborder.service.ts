import { Injectable } from "@angular/core";
import { NgRedux } from "@angular-redux/store";
import { HttpClient } from "@angular/common/http";
import { timeout } from "rxjs/operators";
import { Observable } from "rxjs";
@Injectable({
  providedIn: "root"
})
export class LaborderService {

  constructor(private s: NgRedux<State.Root>,
    private http: HttpClient) { }

  private get state() {
    return this.s.getState();
  }

  private get apiTimeout() {
    return this.state.global.apiTimeout;
  }

  getLabOrders(): Observable<Laborders.Laborder[]> {
    const url = this.state.global.api.laborder.all;
    return this.http.get<Laborders.Laborder[]>(`${url}`).pipe(
      timeout(this.apiTimeout)
    );
  }
}
