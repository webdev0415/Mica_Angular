/**
 * Created by sergeyyudintsev on 20.10.17.
 */
import {Injectable} from "@angular/core";
import {of} from "rxjs";

@Injectable()
export class DataServiceStub {
  isActiveDescriptor$() {
    return of(true);
  }
}
