import { AbstractControl } from "@angular/forms";
import { BehaviorSubject, Subscription } from "rxjs";
import * as _ from "lodash";

export function formCtrlErrorTracker(name: string, ctrl: AbstractControl, publisher: BehaviorSubject<any>): Subscription {
  const sub = ctrl.statusChanges
    .subscribe(status => {
      if (ctrl.invalid) {
        publisher.next({
          ...publisher.value,
          [name]: ctrl.errors
        });
      } else {
        publisher.next(_.omit(publisher.value, name));
      }
    });
  ctrl.updateValueAndValidity();
  return sub;
}

export function compactErrorCollection(error: Symptom.RowError | Symptom.ModifierError,
                                       index: number,
                                       publisher: BehaviorSubject<any>): void {
  if (_.isEmpty(error)) {
    publisher.next(_.reject(publisher.value, {index}));
  } else {
    const matchIndex = _.findIndex(publisher.value, {index});
    publisher.next(~matchIndex
      ? _.sortBy(_.map(publisher.value, (errSrc: Symptom.RowError | Symptom.ModifierError) => {
          return errSrc.index === index ? {...error, index} : errSrc;
        }), "index")
      : _.chain(publisher.value).concat({...error, index}).sortBy("index").value()
  )
  }
}
