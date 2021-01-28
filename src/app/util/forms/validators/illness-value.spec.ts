import { validateIllnessValue } from "./illness-value";
import { defaultState } from "app/app.config";
import IllnessValue = Illness.Normalized.IllnessValue;
import * as symptomsSelectors from "app/state/symptoms/symptoms.selectors";
import * as symptomFactory from "app/modules/symptom/symptom.factory";

describe("illness value validators", () => {
  it("validateIllnessValue idIcd10Code", () => {
    const state = { ...defaultState };
    const illness = { form: { idIcd10Code: null } } as IllnessValue;
    const refType = {
      title: "title",
      values: [{
        name: "namer",
        value: "2"
      }]
    };

    spyOn(symptomsSelectors, "dataStoreRefTypesByGroup").and.returnValue(() => ({ Likelihood: [refType] }));
    expect(() => validateIllnessValue(illness, state)).toThrow();
  });

  it("validateIllnessValue  Corrupted data detected", () => {
    const state = { ...defaultState };
    const illness = {
      entities: {
        symptoms: [
          {
            symptomID: "id"
          }
        ],
        categories: {
          SYMPTCG33: {
            symptoms: ["nlp"]
          }
        }
      },
      form: {
        idIcd10Code: "code",
        groupsComplete: [],
        name: "name",
        state: ""
      } as any
    } as any;
    const refType = {
      title: "title",
      values: [{
        name: "namer",
        value: "2"
      }]
    };

    spyOn(symptomsSelectors, "symptomsDataAll").and.returnValue({ symptomID: { symptomID: "symptomID" } });
    spyOn(symptomsSelectors, "dataStoreRefTypesByGroup").and.returnValue(() => ({ Likelihood: [refType] }));
    expect(() => validateIllnessValue(illness, state)).toThrow();
  });

  it("validateIllnessValue", () => {
    const state = { ...defaultState };
    const illness = {
      entities: {
        symptoms: [
          {
            symptomID: "id"
          }
        ],
        categories: {
          SYMPTCG33: {
            symptoms: ["nlp"]
          }
        }
      },
      form: {
        idIcd10Code: "code",
        name: "name",
        state: ""
      } as any
    } as any;
    const refType = {
      title: "title",
      values: [{
        name: "namer",
        value: "2"
      }]
    };

    spyOn(symptomsSelectors, "symptomsDataAll").and.returnValue({ symptomID: { symptomID: "symptomID" } });
    spyOn(symptomFactory, "defaultLikelihoodValue").and.callFake(val => val);
    spyOn(symptomsSelectors, "dataStoreRefTypesByGroup").and.returnValue(() => ({ Likelihood: refType }));
    expect(() => validateIllnessValue(illness, state)).toThrow();
  });

  it("validateIllnessValue + nlp", () => {
    const state = { ...defaultState };
    const row = {
      multiplier: []
    };
    const sd = {
      multipleValues: "values",
      symptomID: "id",
      rows: [
        {
          multiplier: []
        }
      ],
      symptomsModel: {
        dataStoreTypes: [
          "Importance",
          "Likelihood",
          "TimeUnit",
          "Slope"
        ]
      }
    };
    const illness = {
      entities: {
        symptoms: [
          {
            symptomID: "id",
            rows: [row]
          }, {
            symptomID: "nlp",
            rows: [row]
          }
        ],
        categories: {
          SYMPTCG33: {
            symptoms: ["nlp"]
          }
        }
      },
      form: {
        idIcd10Code: "ICD10",
        groupsComplete: [],
        name: "name",
        state: "state"
      } as any
    } as any;
    const refType = {
      title: "title",
      values: [{
        name: "namer",
        value: "2"
      }]
    };

    spyOn(symptomsSelectors, "symptomsDataAll").and.returnValue({ id: sd });
    spyOn(symptomsSelectors, "cachedNlpSymptoms").and.returnValue({ nlp: { ...sd, symptomID: "nlp" } });
    spyOn(symptomFactory, "defaultModifierValue").and.returnValue({ name: "ethnicity", likelihood: "likelihood" });
    spyOn(symptomFactory, "defaultLikelihoodValue").and.returnValue(refType.values[0].value);
    spyOn(symptomsSelectors, "dataStoreRefTypesByGroup").and.returnValue(() => ({ Likelihood: refType }));
    validateIllnessValue(illness, state);
    expect(illness.entities.symptoms[0].rows[0].likelihood).toEqual(refType.values[0].value);
  });

  it("validateIllnessValue", () => {
    const state = { ...defaultState };
    const row = {
      multiplier: [],
      bias: true,
      modifierValues: [
        {
          name: "age",
          modifierValue: "value"
        }
      ]
    };
    const sd = {
      symptomID: "id",
      rows: [
        {
          multiplier: []
        }
      ],
      symptomsModel: {
        dataStoreTypes: [
          "Importance",
          "Likelihood",
          "TimeUnit",
          "Slope"
        ]
      }
    };
    const illness = {
      entities: {
        symptoms: [
          {
            symptomID: "id",
            rows: [row],
          }
        ],
        categories: {
          SYMPTCG33: {
            symptoms: []
          }
        }
      },
      form: {
        idIcd10Code: "code",
        groupsComplete: [],
        name: "name",
        state: "state"
      } as any
    } as any;
    const refType = {
      title: "title",
      values: [{
        name: "namer",
        value: "2"
      }]
    };

    spyOn(symptomsSelectors, "symptomsDataAll").and.returnValue({ id: sd });
    spyOn(symptomFactory, "defaultModifierValue").and.returnValue({ name: "ethnicity", likelihood: "likelihood" });
    spyOn(symptomFactory, "defaultLikelihoodValue").and.returnValue(refType.values[0].value);
    spyOn(symptomsSelectors, "dataStoreRefTypesByGroup").and.returnValue(() => ({ Likelihood: [refType] }));
    validateIllnessValue(illness, state);
    expect(illness.entities.symptoms[0].rows[0].likelihood).toEqual(refType.values[0].value);
  });
});
