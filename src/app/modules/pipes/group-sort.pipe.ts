import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "groupSort"
})
export class GroupSortPipe implements PipeTransform {

  transform(items: any[]): any[] {
    return items.sort((a, b) => {
      let aLC: string = a.groupFlag;
      let bLC: string = b.groupFlag;
      return aLC < bLC ? -1 : (aLC > bLC ? 1 : 0);
    });
  }

}
