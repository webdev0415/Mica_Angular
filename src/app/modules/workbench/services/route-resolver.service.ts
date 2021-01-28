import { EditorLoaderService } from "./editor-loader.service";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import * as _ from "lodash";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class RouteResolverService {

  constructor(private editorLoader: EditorLoaderService,
              private http: HttpClient) {
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    const sgName = _.last(state.url.split("?")[0].split("/"));
    if (sgName) {
      this.editorLoader.dispatchSymptomGroup(sgName);
      if (sgName === "physical") {
        return this.http.get("assets/mappings/svgShapesPhysical.json");
      }
      if (sgName === "pain") {
        return this.http.get("assets/mappings/svgShapesPain.json");
      }
      return true;
    }
    return false;
  }

}
