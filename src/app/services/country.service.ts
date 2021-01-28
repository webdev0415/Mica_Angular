import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
@Injectable()
export class CountryService {

  constructor(private http: HttpClient) { }

  get countries$(): Observable<MICA.Country[]> {
    return this.http.get<MICA.Country[]>("https://restcountries.eu/rest/v1/all");
  }
}
