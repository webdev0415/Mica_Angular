import {
  defaultScaleValue, optimizeSymptomValue,
  processSymptomValue,
  showAlert,
  symptomRowFactory,
  symptomValueFactory
} from "./symptom.factory";
import Data = Symptom.Data;
import { defaultState } from "app/app.config";
import * as symptomsSelectors from "app/state/symptoms/symptoms.selectors";
import * as ecwSelectors from "app/state/ecw/ecw.selectors";
import * as symptomFactory from "./symptom.factory";

describe("symptom factory", () => {
  const state = { ...defaultState };

  Object.assign(state, {
    symptoms: {
      entities: {
        symptomGroups: {
          group: {
            dataStoreRefTypes: {
              "Likelihood": {
                values: [{ value: "value" }]
              },
              "Slope": { values: [{ value: "value", defaultValue: "value", name: "name" }]},
              "TimeUnit": {
                values: [{}, { name: "name" }]
              }
            }
          }
        }
      }
    },
    nav: {
      activeGroup: "group"
    }
  });

  beforeEach(() => {
    spyOn(symptomsSelectors, "symptomDataPath").and.returnValue(() => ({
      symptomGroup: "group"
    }));
  });

  it("showAlert", () => {
    expect(showAlert(null, "")).toBeUndefined();
  });

  it("showAlert", () => {
    expect(showAlert({} as Data, "")).toBeUndefined();
  });

  it("symptomRowFactory null", () => {
    spyOn(symptomsSelectors, "dataStoreRefTypesByGroup").and.returnValue(() => null);
    expect(symptomRowFactory({symptomsModel: {}} as Data, {...defaultState})).toBeDefined();
  });

  it("symptomRowFactory", () => {
    const data = {symptomsModel: {dataStoreTypes: ["Likelihood"]}} as any;
    expect(symptomRowFactory(data, state)).toBeDefined();
  });

  it("symptomRowFactory defaultScaleValue", () => {
    spyOn(symptomsSelectors, "dataStoreRefTypesByGroup").and.returnValue(() => {
    });
    expect(defaultScaleValue({} as Data, {dataStoreTypes: ["Likelihood"]} as any, state)).toBeUndefined();
  });

  it("symptomValueFactory bodyParts", () => {
    spyOn(symptomsSelectors, "dataStoreRefTypesByGroup").and.returnValue(() => null);
    const bodyParts = ["part"];
    const symptomPhysical = symptomValueFactory({symptomsModel: {}} as Data, bodyParts, {...defaultState});
    expect(symptomPhysical.bodyParts).toEqual(bodyParts);
    const symptomGeneral = symptomValueFactory({symptomsModel: {}} as Data, [], {...defaultState});
    expect(symptomGeneral.bodyParts).toBeUndefined();
  });

  it("defaultScaleValue", () => {
    spyOn(symptomsSelectors, "dataStoreRefTypesByGroup").and.returnValue(() => {
    });
    expect(defaultScaleValue({} as any, {} as any, {...defaultState})).toBeUndefined();
  });

  it("symptomRowFactory", () => {
    spyOn(symptomsSelectors, "dataStoreRefTypesByGroup").and.returnValue(() => ({
      "refType": {}
    }));
    spyOn(symptomFactory, "defaultModifierValue").and.returnValue("");
    const symptomData = {
      symptomsModel: {
        dataStoreTypes: ["Likelihood", "TimeUnit"],
        bias: true,
        minDiagCriteria: false,
        medNecessary: true,
        must: false,
        ruleOut: false
      },
      multiplierValues: "multiplier"
    };
    expect(symptomRowFactory(symptomData as any, {...defaultState})).toBeDefined();
  });

  it("symptomRowFactory", () => {
    const symptomData = {
      symptomsModel: {
        dataStoreTypes: ["Likelihood"]
      },
    };
    spyOn(symptomsSelectors, "dataStoreRefTypesByGroup").and.returnValue(() => ({
      "Likelihood": {
        values: [{value: ""}]
      }
    }));
    expect(symptomRowFactory(symptomData as any, {...defaultState})).toBeDefined();
  });

  it("symptomRowFactory", () => {
    const symptomData = {
      symptomsModel: {
        dataStoreTypes: ["Likelihood"]
      },
    };
    spyOn(symptomsSelectors, "dataStoreRefTypesByGroup").and.returnValue(() => ({
      "Likelihood": {
        values: null
      }
    }));
    expect(symptomRowFactory(symptomData as any, {...defaultState})).toBeDefined();
  });

  it("defaultScaleValue", () => {
    spyOn(symptomsSelectors, "dataStoreRefTypesByGroup").and.returnValue(() => ({
      "Slope": { values: [ { defaultValue: null } ] },
      "TimeUnit": { values: [{}, {name: "name"}] }
    }));
    expect(defaultScaleValue({} as any, {} as any, {...defaultState})).toBeDefined();
  });


  it("defaultScaleValue findDefaultValue Slope", () => {
    spyOn(symptomsSelectors, "dataStoreRefTypesByGroup").and.returnValue(() => ({
      "Slope": { values: [ { defaultValue: true, name: "Name" } ] },
      "TimeUnit": { values: [{}, {name: "name"}] }
    }));
    const defaultValue = defaultScaleValue({} as any, {} as any, {...defaultState})
    expect((defaultValue as Symptom.ScaleValue).slope).toBe("Name");
  });

  it("defaultScaleValue TimeUnit throw", () => {
    spyOn(symptomsSelectors, "dataStoreRefTypesByGroup").and.returnValue(() => ({
      "Slope": { values: [ { defaultValue: {name: "Name"} } ] },
    }));
    const defaultValue = defaultScaleValue({} as any, {} as any, {...defaultState})
    expect(defaultValue).toBeUndefined();
  });

  it("symptomRowFactory sources", () => {
    spyOn(symptomsSelectors, "dataStoreRefTypesByGroup").and.returnValue(() => ({
      "refType": {}
    }));
    spyOn(ecwSelectors, "validationSymptomByID").and.returnValue(() => ({
      rows: [
        { sourceInfo: [ { sourceID: 6 } ]}, {}, { sourceInfo: [ { sourceID: 7 }, { sourceID: 8 } ] },
      ]
    }));
    spyOn(symptomFactory, "defaultModifierValue").and.returnValue("");
    const symptomData = {
      symptomsModel: {
        dataStoreTypes: ["Likelihood", "TimeUnit"],
        bias: true
      },
      multiplierValues: "multiplier"
    };
    const row = symptomRowFactory(symptomData as any, { ...defaultState }) as Symptom.RowValue;
    expect(row.sourceInfo.length).toEqual(3);
  });

  it("processSymptomValue: has rows with multipliers", () => {
    const symptom = {
      rows: [
        {
          multiplier: ["one"]
        },
        {
          multiplier: ["two"]
        },
        {
          multiplier: null,
        },
      ]
    };
    let res;

    res = processSymptomValue(<any>symptom);
    expect(res.rows[0].multiplier[0].toString().split(",").length).toEqual(2);
    expect(res.rows.length).toEqual(2);
  });

  it("processSymptomValue: no rows with multipliers", () => {
    const symptom = {
      rows: [
        {
          multiplier: null,
        },
      ]
    };
    let res;

    res = processSymptomValue(<any>symptom);
    expect(res.rows[0].multiplier).toBeFalsy();
    expect(res.rows.length).toEqual(1);
  });

  it("processSymptomValue: has rows with modifier", () => {
    const symptom = {
      rows: [
        {
          modifierValues: [{ name: "Time" }],
        },
      ]
    };

    processSymptomValue(<any>symptom);
    expect(symptom.rows[0].modifierValues.length).toEqual(1);
  });


  it("optimizeSymptomValue multipliers", () => {
    const rowWithStringMultiplier = { bias: true, multiplier: ["one,two"] };
    const rowWithNumericMultiplier = { bias: true, multiplier: [1] };
    const rowWithoutMultiplier = { bias: true };
    const symptom: any = {};

    symptom.rows = [ rowWithoutMultiplier ];
    optimizeSymptomValue(symptom, state);
    expect(symptom.rows.length).toEqual(1);

    symptom.rows = [ rowWithNumericMultiplier ];
    optimizeSymptomValue(symptom, state);
    expect(symptom.rows.length).toEqual(1);

    symptom.rows = [ rowWithStringMultiplier ];
    optimizeSymptomValue(symptom, state);
    expect(symptom.rows.length).toEqual(2);
  });

  it("optimizeSymptomValue modifiers", () => {
    const validTimeRanges = {
      one: { name: "one", count: 1 },
      two: { name: "two", count: 2 }
    };
    const modifiers = [
      {
        name: "Time",
        scale: {
          timeFrame: Object.keys(validTimeRanges).join(",")
        },
        likelihood: "likely"
      }, {
        name: "Ethnicity",
        likelihood: "most-likely"
      },
    ];
    const rowWithModifiers = { bias: true, modifierValues: modifiers,
      medNecessary: false, minDiagCriteria: false, must: false, ruleOut: false };
    const symptomValue = {
      symptomID: "S7",
      rows: [rowWithModifiers]
    };

    spyOn(symptomsSelectors, "validTimeRanges").and.returnValue(validTimeRanges);
    expect(optimizeSymptomValue(<Symptom.Value>symptomValue, state).rows[0].modifierValues.length).toEqual(3);
  });
});
