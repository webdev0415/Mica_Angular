/**
 * Created by sergeyyudintsev on 05.10.17.
 */
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { of } from "rxjs/observable/of";
import { Subject } from "rxjs/index";
const fakeLaborders = require("../../test/data/laborders.json");


@Injectable()

export class LabordersServiceStub {
  /* istanbul ignore next */
  loadlaborders = new Subject<boolean>();
  /* istanbul ignore next */
  getState() {

  }
  /* istanbul ignore next */
  getLabOrders(): Observable<Laborders.Laborder[]> {
    return of(fakeLaborders)
  }
}
