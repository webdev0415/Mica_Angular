import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "camelCase"
})
export class CamelCasePipe implements PipeTransform {

  transform(input: string): string {
    if (!input) return "";
    return this.toCamelCase(input);
  }

  private toCamelCase(input: string) {
    return input.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
      if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
  }

}
