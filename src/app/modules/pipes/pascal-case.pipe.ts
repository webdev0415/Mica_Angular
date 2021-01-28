import { Pipe, PipeTransform } from "@angular/core";
import { CamelCasePipe } from "./camel-case.pipe";


@Pipe({
  name: "pascalCase"
})
export class PascalCasePipe implements PipeTransform {

  constructor(private camelCasePipe: CamelCasePipe) {}

  transform(input: string, length: number): string {
    if (!input) return "";
    return this.toPascalCase(input);
  }

  private toPascalCase(input: string): string {
    const inCamelCase = this.camelCasePipe.transform(input);
    return inCamelCase.charAt(0).toUpperCase() + inCamelCase.slice(1);
  }

}
