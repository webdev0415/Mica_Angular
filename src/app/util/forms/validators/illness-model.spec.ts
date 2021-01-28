import { inconsistentModelMsgs, modelErrors, nonExistingSymptomProperties, excludeNlpSymptoms } from "./illness-model";
import * as illnessModelValidators from "./illness-model";

describe("ilness model validator", () => {
  it("nonExistingSymptomProperties", () => {
    const symptomValues = [
      {
        rows: [
          {
            multiplier: [],
            modifierValues: []
          }
        ] as any,
        symptomID: "sympId"
      } as any
    ];
    const symptomData = {
      "sympId": {
        multipleValues: null,
        symptomsModel: {}
      } as any
    };

    expect(nonExistingSymptomProperties(symptomValues, symptomData).nonExistingMultiplier.length).toEqual(1);
  });

  it("nonExistingSymptomProperties", () => {
    const symptomValues = [
      {
        rows: [
          {
            multiplier: null,
            modifierValues: null
          }
        ] as any,
        symptomID: "sympId"
      } as any
    ];
    const symptomData = {
      "sympId": {
        multipleValues: null,
        symptomsModel: {}
      } as any
    };

    expect(nonExistingSymptomProperties(symptomValues, symptomData).nonExistingMultiplier.length).toEqual(0);
  });


  it("nonExistingSymptomProperties", () => {
    const symptomValues = [
      {
        rows: [
          {
            multiplier: null,
            modifierValues: null
          }
        ] as any,
        symptomID: "sympId"
      } as any
    ];
    const symptomData = {
      Id2: {}
    } as any;

    expect(nonExistingSymptomProperties(symptomValues, symptomData).nonExistingMultiplier.length).toBe(0);
  });

  it("modelErrors", () => {
    const value = {
      entities: {
        symptoms: {
          "symptom": {
            symptomID: "symptom"
          }
        },
        categories: {
          "category": {
            categoryID: "category"
          }
        },
        sections: {
          "section": {
            sectionID: "section"
          }
        },
        symptomGroups: {}
      } as any
    } as any;
    const data = {
      symptoms: ["symp"],
      categories: ["cat"],
      sections: ["sec"],
      symptomGroups: {}
    };

    expect(modelErrors(value as any, data as any).nonExisting.symptoms).toBeDefined();
  });

  it("inconsistentModelMsgs", () => {
    const value = {
      entities: {
        symptoms: {
        },
        categories: {
          SYMPTCG33: {
            symptoms: ["nlp"]
          }
        },
        sections: {
        },
        symptomGroups: {
          "physical": []
        }
      }
    };
    const data = {
      categories: {
      },
      symptoms: {
        misplacedId: {
          name: "sympName"
        }
      },
      sections: {}
    };

    spyOn(illnessModelValidators, "nonExistingSymptomProperties").and.returnValue({
      nonExistingMultiplier: [],
      nonExistingModifier: ["modifier"]
    });
    spyOn(illnessModelValidators, "symptomsInWrongCat").and.callFake(() => [
      ["catName", "catId", ["misplacedId", "id2"]
    ]]);
    expect(inconsistentModelMsgs(value as any, data as any)).toBeDefined();
  });

  it("excludeNlpSymptoms SYMPTCG33", () => {
    const value = {
      entities: {
        symptoms: { nlp: {} },
        categories: {
          SYMPTCG33: { symptoms: ["nlp"] }
        }
      }
    };

    const {symptoms, categories} = excludeNlpSymptoms(value as any);
    expect(symptoms).toEqual({});
    expect(categories).toEqual({});
  });

  it("excludeNlpSymptoms general", () => {
    const value = {
      entities: {
        symptoms: { "general": {} },
        categories: {
          GENERAL: { symptoms: ["general"] }
        }
      }
    };
    const {symptoms, categories} = excludeNlpSymptoms(value as any);

    expect(symptoms).toEqual({ general : {} as Symptom.Value });
    expect(categories).toEqual({ GENERAL: { symptoms: ["general"] } as any });
  })
});
