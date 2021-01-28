import {Pipe, PipeTransform} from "@angular/core";
import * as _ from "lodash";

@Pipe({name: "rowError"})
export class RowPropertyErrorPipe implements PipeTransform {
    transform(value: any, args?: any[]): string[] {
      return _.reduce(value, (msgs, v, k)  => {
        let message = "";
        switch (k) {
          case "required":
            message = "Value is missing."
            break;
          case "pattern":
            message = "Value is not a valid one."
          default:
            message = "There's something wrong with value."
            console.error("Please write a case for this type of value: " + value);
            break;
        }
        return [...msgs, message]
      }, <string[]>[]);
    }
}
