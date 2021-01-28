import * as _ from "lodash";
import {
  defaultLikelihoodValue,
  defaultModifierValue
} from "app/modules/symptom/symptom.factory";
import { excludeNlpSymptoms } from "./illness-model";
import {
  dataStoreRefTypesByGroup,
  allDataStoreRefTypes,
  symptomDataPath,
  symptomsDataAll,
  cachedNlpSymptoms
} from "app/state/symptoms/symptoms.selectors";

export function validateIllnessValue(v: Illness.Normalized.IllnessValue, s: State.Root) {
  if (!v || !v.form.idIcd10Code) {
    throw Error("Unable to determine illness value");
  }

  checkRootValueValidity(v.form);

  const allSymptomsData = {
    ...symptomsDataAll(s),
    ...cachedNlpSymptoms(s)
  };
  const { symptoms } = excludeNlpSymptoms(v);

  _.each(symptoms, sv => {
    const sd = allSymptomsData[sv.symptomID];
    const { rows } = sv;

    if (!sd) {
      throw new Error(`Corrupted data detected. Symptom ${sv.symptomID}
      found in ${v.form.idIcd10Code} no longer exists in symptoms general data.`);
    }

    rows.forEach((row) => {
      validateSymptomRow(sd, row, s);
    });
  });
}

function checkRootValueValidity(value: Illness.Normalized.FormValue) {
  const paths = ["name", "idIcd10Code", "groupsComplete", "state"];

  _.each(paths, path => {
    if (!_.has(value, path)) {
      throw new Error(`Corrupted data detected. Root property missing from ${value.idIcd10Code}'s form: ${path}`);
    }
  });
}

// function isRootSymptomValid(idIcd10Code: string, value: Symptom.Value): boolean {
//   let error;
//   const paths = ["antithesis", "question"];
//   _.each(paths, path => {
//     if (!_.has(value, path)) {
//       throw new Error(`Corrupted data detected. Root property missing in ${idIcd10Code} ${value.symptomID}'s form: ${path}`);
//     }
//   });
//   return true;
// }

function validateSymptomRow(sData: Symptom.Data,
                    value: Symptom.RowValue,
                    state: State.Root) {
  const { symptomsModel } = sData;
  const group = symptomDataPath(sData.symptomID)(state).symptomGroup;
  const refTypes: Workbench.DataStoreRefTypesDictionary = dataStoreRefTypesByGroup(group)(state) || allDataStoreRefTypes(state);
  const hasModifier = !!~_.indexOf(symptomsModel.dataStoreTypes, "TimeUnit");
  const hasLikelihood = !!~symptomsModel.dataStoreTypes.indexOf("Likelihood");

  if (!_.has(value, "bias")) value.bias = symptomsModel.bias;

  if (sData.multipleValues && (!_.isArray(value.multiplier) || !value.multiplier.length)) {
    value.multiplier = [""];
  }

  if (hasLikelihood && !_.has(value, "likelihood")) {
    value.likelihood = defaultLikelihoodValue(refTypes.Likelihood);
  }

  if (hasModifier) {
    if (!value.modifierValues) {
      value.modifierValues = [defaultModifierValue(sData, undefined, state)];
    } else {
      value.modifierValues.forEach(modifier => {
        validateModifier(sData, modifier, state);
      });
    }
  } else {
    delete value.modifierValues;
  }
}

function validateModifier(sData: Symptom.Data,
                         value: Symptom.ModifierValue,
                         state: State.Root) {
  const valueName = value.name.toLowerCase();
  const isEthnicityOrRecurs = valueName === "ethnicity" || valueName === "recurs";
  const hasScale = sData.symptomsModel.dataStoreTypes && !!~sData.symptomsModel.dataStoreTypes.indexOf("TimeUnit");

  const ethnicityPaths = ["modifierValue"];
  const scalePaths = [
    "scale.timeFrame",
  ];
  const paths = _.concat(["name", "likelihood"], isEthnicityOrRecurs ? ethnicityPaths : scalePaths);

  // test for incoherent values
  if (isEthnicityOrRecurs) {
    delete value.scale;
  }

  if (hasScale && _.has(value, "modifierValue")) {
    value.name = "Time";
  }

  // tests for existence
  const defaultModifier: Symptom.ModifierValue = defaultModifierValue(sData, value.name, state);

  _.each(paths, path => {
    if (!_.has(value, path)) {
      _.set(value, path, _.get(defaultModifier, path));
    }
  });
}
