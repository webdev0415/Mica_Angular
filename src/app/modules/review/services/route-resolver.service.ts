import { RequiredDataService } from "./required-data.service";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import * as _ from "lodash";

@Injectable()
export class RouteResolverService {

  constructor(private requiredData: RequiredDataService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.requiredData.hasActiveIllness();
  }

}
