import { Response } from "@angular/http";
import { Observable } from "rxjs";
import {ErrorObservable} from "rxjs/observable/ErrorObservable";

export function parseError(error: Response) {
    try {
      try {
        const json = error.json();
        return ErrorObservable.create(json);
      } catch (err) {
        console.log("error: ", error);
        return ErrorObservable.create({
          status: error.status,
          message: error.text()
        });
      }
    } catch (error) {
      return ErrorObservable.create("Unable to parse response");
    }
  }
