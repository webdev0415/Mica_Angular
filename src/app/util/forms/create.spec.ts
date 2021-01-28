import {formGroupFactory, symptomTemplateCtrlFactory, treatmentCtrlFactory} from "./create";
import {defaultState} from "../../app.config";
import * as validators from "./validators";
import {FormControl, FormGroup} from "@angular/forms";

describe("form create util", () => {
  it("formGroupFactory", () => {
    const formVal = {"groupsComplete": []};
    expect(formGroupFactory(formVal, {...defaultState})).toBeDefined();
  });

  it("formGroupFactory", () => {
    spyOn(validators, "allGroupsComplete").and.returnValue(() => {});
    const warnSpy = spyOn(console, "warn").and.callThrough();
    const formVal = {"groups": {}};
    expect(formGroupFactory(formVal, {...defaultState})).toBeDefined();
    expect(warnSpy).toHaveBeenCalled();
  });

  it("formGroupFactory", () => {
    spyOn(validators, "allGroupsComplete").and.returnValue(() => {});
    const formVal = {"medNecessary": undefined};
    expect(formGroupFactory(formVal, {...defaultState})).toBeDefined();
  });

  it("formGroupFactory", () => {
    function User() {
    }
    const obj = [new User, new User];
    spyOn(validators, "allGroupsComplete").and.returnValue(() => {});
    expect(() => formGroupFactory(obj, {...defaultState})).toThrow();
  });

  it("formGroupFactory", () => {
    spyOn(validators, "allGroupsComplete").and.returnValue(() => {});
    const formVal = {"minDiagCriteria": undefined};
    expect(formGroupFactory(formVal, {...defaultState})).toBeDefined();
  });

  it("formGroupFactory", () => {
    spyOn(validators, "allGroupsComplete").and.returnValue(() => {});
    const formVal = {"other": undefined};
    expect(formGroupFactory(formVal, {...defaultState})).toBeDefined();
  });

  it("symptomTemplateCtrlFactory", () => {
    const s = {...defaultState};
    s.symptomTemplates.editableProperties = [];
    expect(() => symptomTemplateCtrlFactory(null, s)).toThrow();
  });

  it("symptomTemplateCtrlFactory", () => {
    const s = {...defaultState};
    Object.assign(s, {symptomTemplates: {editableProperties: [{"name": "antithesis"}, {"name": "criticality"}]}});
    expect(() => symptomTemplateCtrlFactory(null, s)).toThrow();
  });

  it("symptomTemplateCtrlFactory", () => {
    const s = {...defaultState};

    Object.assign(s, {
      symptomTemplates: {
        editableProperties: [
          {
            name: "antithesis",
            minMax: [0, 1]
          },
          {
            name: "criticality",
            minMax: [0, 1]
          }
        ]
      }
    });

    const res = symptomTemplateCtrlFactory({
      icd10RCodes: {1: 1},
      snomedCodes: {1: 1},
      snomedNames: {root: ""},
      groupID: [3, 4]
    } as any, s);

    expect(res).toBeDefined();
    expect(res.value.groupID).toEqual("3,4");
  });

  it("resetControl", () => {
    const control = new FormControl("");
    control.setValue("1");
  });

  it("treatmentCtrlFactory", () => {
    expect(treatmentCtrlFactory({value: "value"} as any, {...defaultState}) instanceof FormGroup).toBeTruthy();
  });

});
