import { activeIllnessErrors, isActiveIllnessValid } from "app/state/workbench/workbench.selectors";
import { select } from "@angular-redux/store";
import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { Observable } from "rxjs";
import * as _ from "lodash";
import { pluck, map, filter } from "rxjs/operators";
import { of } from "rxjs/observable/of";

@Component({
  selector: "error-illness-value",
  templateUrl: "./illness-value.component.html",
  styleUrls: ["./illness-value.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IllnessValueComponent implements OnInit {
  @select(activeIllnessErrors) illErrors: Observable<Task.ActiveIllnessError>;
  @select(isActiveIllnessValid) isActiveIllnessValid: Observable<boolean>;
  symptomErrors: Observable<{[sg: string]: Symptom.ValueError[]}> = this.illErrors.pipe(pluck("symptoms"));
  symptomGroupsWithErrors: Observable<string[]> = of([]);

  private getKeys = (err: any): string[] => _.keys(err);

  constructor() {
    this.symptomGroupsWithErrors = this.symptomErrors.pipe(map(this.getKeys));
  }

  ngOnInit() {
  }

  get illRootErrors(): Observable<string[]> {
    return this.illErrors
      .pipe(
        pluck("illness"),
        filter(e => e && !_.isEmpty(e)),
        map((error: Task.IllnessRootError) => {
          return _.reduce(error, (msgs, value, errName) => {
            switch (errName) {
              case "groupsComplete":
                return [...msgs, "Not all symptom groups are complete"];
              default:
                return msgs;
            }
          }, [] as string[]);
        })
      )
  }

  private makeSenseOfMessage(errors: { [errorType: string]: any }): string[] {
    return _.reduce(errors as { [key: string]: any }, (errs, propertyValue, property: string) => {
      const flatten = _.reduce(propertyValue, (parsed, errMessage, errorName) => {
        const _name = property.charAt(0).toUpperCase() + property.slice(1);

        switch (errorName) {
          case "required":
            return [...parsed, _name + " is required."];
          case "pattern":
            return [...parsed, _name + " doesn't have a valid value."];
          case "type":
            return [...parsed, _name + " is of the wrong type. Please contact support."];
          case "length":
            if (errMessage === "short") return [...parsed, _name + " is too short."];
            if (errMessage === "long") return [...parsed, _name + " is too long."];
            return [...parsed, _name + " is of wrong length."];
          default:
            return [...parsed, errMessage.toString()];
        }
      }, [] as string[]);

      return [...errs, ...flatten];
    }, [] as string[]);
  }

  bodyPartsError(error: { [errorType: string]: any} ): string {
    return this.makeSenseOfMessage({ bodyParts: error })[0];
  }

  symptomRootErrors(row: Symptom.RowError): string[] {
    const rootProps = ["bias", "likelihood", "multiplier"];
    return this.makeSenseOfMessage(_.pick(row, rootProps) as { [key: string]: any });
  }

  modifierRootErrors(modifier: Symptom.ModifierError): string[] {
    const rootProps = ["modifierValue", "likelihood"];
    return this.makeSenseOfMessage(_.pick(modifier, rootProps) as { [key: string]: any });
  }

  scaleErrors(scale: Symptom.ScaleError): string [] {
    return _.map(this.makeSenseOfMessage(scale), m => "Scale " + m);
  }

}
