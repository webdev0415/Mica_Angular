import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { of } from "rxjs/observable/of";

@Injectable()
export class UniquenessServiceStub {
  checkUniqueness(): Observable<any> {
    console.log("FAKE CHECK UNIQUENESS");
    return of({});
  }
}
