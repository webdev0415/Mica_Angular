/**
 * Created by vladimirValov on 02/03/2018.
 */
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {of} from "rxjs/observable/of";
const fakeEcwIllnesses: ECW.Illness[] = require("../../test/data/ecwIllnesses.json");
const fakeEcwIllnessesData: ECW.IllnessData[] = require("../../test/data/ecwIllnessesData.json").userData;

const response: ECW.Response = {
  content: fakeEcwIllnesses,
  first: true,
  pagenumber: 0,
  pageSize: 20,
  elementsInPage: 20,
  last: false,
  totalElements: 2388,
}


@Injectable()
export class EcwServiceStub {
  getIllnesses() {
    return of(response);
  }

  getIllnessByIcd10Code(code: string) {
    return of(fakeEcwIllnessesData);
  }
}
