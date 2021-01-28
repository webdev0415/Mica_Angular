import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http"
import { of, Observable } from "rxjs";
import { map } from "rxjs/operators";
@Injectable()
export class SvgShapesService {
  constructor(private http: HttpClient) { }

  getShapesByGroup(group: string): Observable<Object | null> {
    if (group === "physical")
      return this.http.get("assets/mappings/svgShapesPhysical.json");
    if (group === "pain")
      return this.http.get("assets/mappings/svgShapesPain.json");
    return of(null)
  }
}
