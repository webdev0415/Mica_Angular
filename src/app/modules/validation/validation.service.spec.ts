import { TestBed } from "@angular/core/testing";

import { ValidationService } from "./validation.service";
import { NgRedux } from "@angular-redux/store";
import { defaultState } from "app/app.config";
import { of } from "rxjs/observable/of";
import * as _ from "lodash";
import * as illnessModelValidators from "app/util/forms/validators/illness-model";
import * as illnessValueValidators from "app/util/forms/validators/illness-value";
import * as symptomSelectors from "app/state/symptoms/symptoms.selectors";
import * as workbenchSelectors from "app/state/workbench/workbench.selectors";
import * as workbenchActions from "app/state/workbench/workbench.actions";

const mockRedux = {
  getState: () => _.cloneDeep(defaultState),
  select: (selector) => of(selector(defaultState)),
  dispatch: (arg: any) => {
  }
};

describe("ValidationService", () => {
  let redux: NgRedux<State.Root>;
  let service: ValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ValidationService,
        { provide: NgRedux, useValue: mockRedux }
      ]
    });
  });

  beforeEach(() => {
    redux = TestBed.get(NgRedux);
    service = TestBed.get(ValidationService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("state", () => {
    spyOn(redux, "getState").and.returnValue({});
    expect(service["state"]).toEqual({} as any);
  });

  it("sanitizeIllness", () => {
    const illness = {
      form: {
        idIcd10Code: "code",
        version: 1
      }
    };
    const consoleError = spyOn(console, "error");

    spyOn(illnessModelValidators, "modelErrors").and.callFake(() => {
      throw new Error("");
    });
    expect(() => service.sanitizeIllness(illness as any)).toThrow();
    expect(consoleError).toHaveBeenCalled();
  });

  xit("sanitizeIllness", () => {
    const modelErrors = {
      nonExisting: {
        sections: ["section"],
        categories: []
      },
      misplaced: {
        symptoms: ["", "", []]
      },
      invalidValues: {
        bodyParts: ["part"]
      }
    };
    const illness = {
      entities: {
        sections: {},
        categories: {
          category: {
            symptoms: []
          }
        }
      }
    };

    spyOn(illnessModelValidators, "modelErrors").and.returnValue(modelErrors);
    spyOn(illnessValueValidators, "validateIllnessValue").and.callFake(() => {});
    expect(service.sanitizeIllness(illness as any)).toBeDefined();
  });

  xit("sanitizeIllness", () => {
    const modelErrors = {
      nonExisting: {
      },
      misplaced: {
        symptoms: []
      },
      invalidValues: {
        bodyParts: []
      }
    };
    const illness = {
      entities: {
        sections: {
          section: {
          }
        },
        categories: {
          category: {
            symptoms: []
          }
        },
        symptomGroups: {
          group: {
          }
        }
      }
    };

    spyOn(illnessModelValidators, "modelErrors").and.returnValue(modelErrors);
    spyOn(illnessValueValidators, "validateIllnessValue").and.callFake(() => {});
    expect(service.sanitizeIllness(illness as any)).toBeDefined();
  });

  it("getSymptomsWithInvalidMultiplier", () => {
    const illness = {
      entities: {
        symptoms: {
          SYMPT1: { symptomID: "SYMPT1", rows: [{ multiplier: ["Unspecified"] }] },
          SYMPT2: { symptomID: "SYMPT2", rows: [{ multiplier: ["validMultiplier"] }] },
          SYMPT3: { symptomID: "SYMPT3", rows: [{ multiplier: null }] },
        },
        sections: { section: {} },
        categories: { category: { } },
        symptomGroups: { group: { } }
      },
      form: {}
    };
    let result;

    spyOn(symptomSelectors, "multiplierValues").and.returnValue(() => ({
      values: [{ name: "validMultiplier" }]
    }));
    result = service["getSymptomsWithInvalidMultiplier"](illness as any);
    expect(result).toEqual([{ symptomID: "SYMPT1", rows: [{ multiplier: [""] }] }] as any);
  });

  it("getSymptomsWithInvalidMultiplier multiplierValues", () => {
    const symptoms = {
      SYMPT1: { symptomID: "SYMPT1", rows: [{ multiplier: ["Unspecified"] }] },
    };
    const illness = {
      entities: {
        symptoms,
        sections: { "section": {} },
        categories: { "category": { } },
        symptomGroups: { "group": { } }
      },
      form: {}
    };
    let result;

    spyOn(symptomSelectors, "multiplierValues").and.returnValue(() => null);
    result = service["getSymptomsWithInvalidMultiplier"](illness as any);
    expect(result).toEqual([]);
  });

  it("addSymptomsErrorsToTODO should not dispatch", () => {
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();

    spyOn<any>(service, "getSymptomsWithInvalidMultiplier").and.returnValue([ ]);
    service.addSymptomsErrorsToTODO({} as any);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it("addSymptomsErrorsToTODO should dispatch", () => {
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();
    const completeSymptomGroupSpy = spyOn(workbenchActions, "completeSymptomGroup").and.callThrough();

    spyOn(workbenchSelectors, "isSymptomGroupComplete").and.returnValue(() => true);
    spyOn(symptomSelectors, "symptomDataPath").and.returnValue(() => ({symptomGroup: "general"}));
    spyOn(symptomSelectors, "symptomNameFromID").and.returnValue(() => "Name");
    spyOn<any>(service, "getSymptomsWithInvalidMultiplier").and.returnValue([
      { symptomID: "SYMPT1", rows: [{ multiplier: [""] }], bodyParts: "bodyParts" },
      { symptomID: "SYMPT1", rows: [{ multiplier: ["multiplier"] }] }
    ]);
    service.addSymptomsErrorsToTODO({} as any);
    expect(completeSymptomGroupSpy).toHaveBeenCalled();

    expect(dispatchSpy).toHaveBeenCalled();
  });

  it("addSymptomsErrorsToTODO should  dispatch", () => {
    const completeSymptomGroupSpy = spyOn(workbenchActions, "completeSymptomGroup").and.callThrough();
    spyOn(workbenchSelectors, "isSymptomGroupComplete").and.returnValue(() => false);

    spyOn(symptomSelectors, "symptomDataPath").and.returnValue(() => ({symptomGroup: "general"}));
    spyOn(symptomSelectors, "symptomNameFromID").and.returnValue(() => "Name");
    spyOn<any>(service, "getSymptomsWithInvalidMultiplier").and.returnValue([
      { symptomID: "SYMPT1", rows: [{ multiplier: [""] }]},
    ]);
    service.addSymptomsErrorsToTODO({} as any);
    expect(completeSymptomGroupSpy).not.toHaveBeenCalled();
  })
});
