import {Pipe, PipeTransform} from "@angular/core";

@Pipe({ name: "correctSpelling" })
export class CorrectSpellingPipe implements PipeTransform {
  transform(value: string) {
    if (value.toUpperCase() === "BEHAVIOUR") {
      return "Behavior"
    }
    return value;
  }
}
