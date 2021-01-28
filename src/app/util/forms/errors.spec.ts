import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {compactErrorCollection, formCtrlErrorTracker} from "./errors";
import RowError = Symptom.RowError;
import {FormControl, Validators} from "@angular/forms";

describe("form errors util", () => {
  it("compactErrorCollection", () => {
    const error = {} as RowError;
    const publisher = new BehaviorSubject([]);
    const nextSpy = spyOn(publisher, "next").and.callThrough();
    compactErrorCollection(error, 0, publisher);
    expect(nextSpy).toHaveBeenCalled();
  });

  it("compactErrorCollection", () => {
    const index = 0;
    const error = {
      index: index
    } as RowError;
    const publisher = new BehaviorSubject([error]);
    const nextSpy = spyOn(publisher, "next").and.callThrough();
    compactErrorCollection(error, index, publisher);
    expect(nextSpy).toHaveBeenCalled();
  });

  it("compactErrorCollection", () => {
    const index = 0;
    const error = {
      index: index
    } as RowError;
    const publisher = new BehaviorSubject([error, {index: 1}]);
    const nextSpy = spyOn(publisher, "next").and.callThrough();
    compactErrorCollection(error, index, publisher);
    expect(nextSpy).toHaveBeenCalled();
  });

  it("compactErrorCollection", () => {
    const index = 0;
    const error = {
      index: index
    } as RowError;
    const publisher = new BehaviorSubject([error]);
    const nextSpy = spyOn(publisher, "next").and.callThrough();
    compactErrorCollection(error, 1, publisher);
    expect(nextSpy).toHaveBeenCalled();
  });

  it("formCtrlErrorTracker", () => {
    const name = "name";
    const ctrl = new FormControl("ctrl", [Validators.required]);
    const publisher = new BehaviorSubject<boolean>(true);
    const publisherNextSpy = spyOn(publisher, "next").and.callThrough();
    const errorTrackerSub = formCtrlErrorTracker(name, ctrl, publisher);
    ctrl.setValue(null);
    expect(publisherNextSpy).toHaveBeenCalled();
    errorTrackerSub.unsubscribe();
  });

});
