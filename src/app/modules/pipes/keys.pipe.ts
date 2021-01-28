import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "keys"
})
export class KeysPipe implements PipeTransform {

  transform(input: {[key: string]: any}): string[] {
    if (!input) return [];
    return Object.keys(input);
  }
}
