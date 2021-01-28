import {Pipe, PipeTransform} from "@angular/core";
import * as _ from "lodash";

@Pipe({
  name: "optionName"
})
export class OptionNamePipe implements PipeTransform {

  transform(arrValue: any, args?: any, isMultiSelect = false): any {
    if (arrValue && args && isMultiSelect) {
      const arrayArgs = args.split(",");
      const matchingOption = arrValue.filter((obj: any) => _.includes(arrayArgs, obj.value.toString()));
      return matchingOption.length ? _.map(matchingOption, "name").join(", ") : args;
    } else if (arrValue && args) {
      const matchingOption = arrValue.find((obj: any) => _.isEqual(obj.value, args));
      return matchingOption ? matchingOption.name : args;
    }

    return args;
  }

}
