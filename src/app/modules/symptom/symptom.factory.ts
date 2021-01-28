import {
  allDataStoreRefTypes,
  symptomDataPath,
  dataStoreRefTypesByGroup,
  validTimeRanges
} from "app/state/symptoms/symptoms.selectors";
import * as _ from "lodash";
import { validationSymptomByID } from "app/state/ecw/ecw.selectors";
import RowValue = Symptom.RowValue;
import ModifierValue = Symptom.ModifierValue;
import DataStoreRefType = Workbench.DataStoreRefType;

export function symptomValueFactory(symptomData: Symptom.Data, bodyParts: string[], state: State.Root): Symptom.Value {
  const row = symptomRowFactory(symptomData, state);

  if (!row) throw Error("Unable to create symptom value");

  const symptom: Symptom.Value = {
    symptomID: symptomData.symptomID,
    rows: [row]
  };

  if (bodyParts && bodyParts.length) symptom.bodyParts = bodyParts;

  return symptom;
}

export function symptomRowFactory(symptomData: Symptom.Data,
                                  state: State.Root): Symptom.RowValue | null {
  const group = symptomDataPath(symptomData.symptomID)(state).symptomGroup;
  const refTypes: Workbench.DataStoreRefTypesDictionary = dataStoreRefTypesByGroup(group)(state) || allDataStoreRefTypes(state);
  const model = symptomData.symptomsModel;
  const hasScale = !!~_.indexOf(model.dataStoreTypes, "TimeUnit");
  const multiplierValues = symptomData.multipleValues;
  let rowFailed;
  const row: Symptom.RowValue = {
    // default bias
    bias: _.has(model, "bias") ? model.bias : true,
    medNecessary: _.has(model, "medNecessary") ? model.medNecessary : false,
    minDiagCriteria: _.has(model, "minDiagCriteria") ? model.minDiagCriteria : false,
    must: _.has(model, "must") ? model.must : false,
    ruleOut: _.has(model, "ruleOut") ? model.ruleOut : false,
    sourceInfo: [],
  };

  if (hasScale) {
    row.modifierValues = [defaultModifierValue(symptomData, "Time", state)];
    /* istanbul ignore next */
    if (!row.modifierValues) rowFailed = true;
  } else {
    row.likelihood = "";
  }

  if (multiplierValues) {
    row.multiplier = [""];
  }

  _.each(model.dataStoreTypes, dataStoreType => {
    const data = refTypes[dataStoreType];

    if (dataStoreType === "Likelihood") {
      if (!hasScale) {
        const likelihoodValue = defaultLikelihoodValue(data);
        /* istanbul ignore next */
        if (likelihoodValue === undefined) {
          showAlert(symptomData, "likelihood");
          rowFailed = true;
        } else {
          row["likelihood"] = likelihoodValue.toLowerCase();
        }
      }
    }
  });

  const nlpData = validationSymptomByID(symptomData.symptomID)(state);

  if (nlpData) {
    row.sourceInfo = nlpData.rows.reduce((ss: SourceInfo.SourceInfoType[], r) => {
      r.sourceInfo && ss.push(...r.sourceInfo);
      return ss;
    }, []);
  }

  /* istanbul ignore next */
  return rowFailed ? null : row;
}

function findDefaultValue(storeType: Workbench.DataStoreRefType): string {
  const defaultValue = _.find(storeType.values, (v: any) => v.defaultValue);

  return defaultValue ? (defaultValue as any).name : "";
}

export function showAlert(symptomData: Symptom.Data, name: string): void {
  if (!symptomData) return alert("No symptomData");

  return alert(`There is a problem with ${symptomData.name}.
                Please contact support quoting:
                Factory: ${symptomData.symptomID} ${name}`);
}

/* istanbul ignore next */
export function defaultModifierValue(symptomData: Symptom.Data,
                                     /* istanbul ignore next */
                                     name: Symptom.ModifierType = "Time",
                                     state: State.Root): Symptom.ModifierValue {

  return {
    name,
    likelihood: "",
    scale: defaultScaleValue(symptomData, symptomData.symptomsModel, state)
  };
}

export function defaultLikelihoodValue(data: DataStoreRefType): string {
  const likelihoodDefault = data.values && data.values[0];

  return likelihoodDefault ? (likelihoodDefault.value || "") : "";
}

export function defaultScaleValue(symptomData: Symptom.Data,
                                  model: Symptom.Model,
                                  state: State.Root): Symptom.ScaleValue | undefined {
  const group = symptomDataPath(symptomData.symptomID)(state).symptomGroup;
  const refTypes: Workbench.DataStoreRefTypesDictionary = dataStoreRefTypesByGroup(group)(state);
  let slope, timeUnit;

  try {
    slope = findDefaultValue(refTypes["Slope"]);
  } catch (error) {
    showAlert(symptomData, "Slope");
    return;
  }

  try {
    const timeUnitDefault = 1;
    const timeUnitRef = refTypes["TimeUnit"];

    if (!timeUnitRef || !timeUnitRef.values) throw Error("Unable to get time unit");

    timeUnit = timeUnitRef.values[timeUnitDefault].name;
  } catch (error) {
    console.error("Unable to get default scale values: ", error);
    showAlert(symptomData, "TimeUnit");
    return;
  }

  return {
    upperTimeLimit: 10,
    scaleTimeLimitStart: 0,
    slope: slope,
    timeUnit: timeUnit,
    value: "",
    timeFrame: ""
  };
}

function getObjectIndex(arr: Array<any>, obj: any, propertyToExclude: string): number {
  for (let i = 0; i < arr.length; i++) {
    const currObj = arr[i];
    // compare objects without multiplier property, because the property values are different in comparing objects
    // and they are being merged
    const objectsAreEqual = _.isEqual({...obj, [propertyToExclude]: null}, {...currObj, [propertyToExclude]: null});

    if (objectsAreEqual) {
      return i;
    }
  }

  return -1;
}

/**
 * Groups symptom row modifiers for further work
 * Changes exactly the passed value
 * @param row Symptom row
 */
export function groupRowModifiers(row: RowValue) {
  row.modifierValues = _.sortBy(row.modifierValues, ["name", "likelihood"]);

  const rowModifiers = row.modifierValues;
  const resRowModifiers: ModifierValue[] = [];
  const timeFrameValues: { [likelihood: string]: { [timeFrame: string]: any } } = {};
  const scalableModifiers: { [likelihood: string]: ModifierValue } = {};

  for (let j = 0; j < rowModifiers.length; j++) {
    const rowModifier = rowModifiers[j];
    const { name, scale, likelihood } = rowModifier;
    const modifierIndex = getObjectIndex(resRowModifiers, rowModifier, "modifierValue");
    const isScalable = name.toLowerCase() === "time";

    if (isScalable && scale && scale.timeFrame && likelihood) {
      const timeFrames = timeFrameValues[likelihood] || {};

      timeFrameValues[likelihood] = timeFrames;
      timeFrames[scale.timeFrame] = true;

      if (!scalableModifiers[likelihood]) {
        resRowModifiers.push(rowModifier);
        scalableModifiers[likelihood] = rowModifier;
      }
    } else if (modifierIndex < 0) {
      resRowModifiers.push(rowModifier);
    } else {
      const existingModifier = resRowModifiers[modifierIndex];
      const currentModifierValue = (existingModifier as any).modifierValue;

      if (currentModifierValue) {
        const existingModifierValues = currentModifierValue.split(",");

        existingModifierValues.push((rowModifier as any).modifierValue);
        existingModifierValues.sort();
        existingModifier.modifierValue = _.uniq(existingModifierValues).join(",");
      }
    }
  }

  Object.keys(scalableModifiers).forEach(likelihood => {
    const timeFrames = timeFrameValues[likelihood];
    const modifier = scalableModifiers[likelihood];

    modifier.scale && (modifier.scale.timeFrame = Object.keys(timeFrames).join(","));
  });

  row.modifierValues = resRowModifiers;
}

/**
 * Optimizes symptom value for further work
 * @param v Current symptom value
 * @returns A new Symptom.Value object
**/
export function processSymptomValue(v: Symptom.Value): Symptom.Value {
  const rowsWithMultipliers = [];
  const rowsWithoutMultipliers = [];
  let transformedV: Symptom.Value = <any>{};

  for (let i = 0; i < v.rows.length; i++) {
    const row = _.cloneDeep(v.rows[i]);
    const multiplier = row.multiplier;

    if (row.modifierValues && row.modifierValues.length) {
      groupRowModifiers(row);
    }

    if (multiplier && multiplier.length && typeof multiplier[0] === "string" && (<string>multiplier[0]).length) {
      rowsWithMultipliers.push(row);
    } else {
      rowsWithoutMultipliers.push(row);
    }
  }

  if (rowsWithMultipliers.length > 0) {
    const resRows = [];

    for (let i = 0; i < rowsWithMultipliers.length; i++) {
      const rowWithMultiplier = rowsWithMultipliers[i];
      const objectIndex = getObjectIndex(resRows, rowWithMultiplier, "multiplier");

      if (objectIndex < 0) {
        //  row is not added yet
        resRows.push(rowWithMultiplier);
      } else {
        //  row with these values already added, append new multiplier value into existing row
        const existingObject = resRows[objectIndex];
        const existingMultiplierValues = (<string>(<any>existingObject).multiplier[0]).split(",");
        const multiplierValuesToAppend = (<string>(<any>rowWithMultiplier).multiplier[0]).split(",");
        const mergedMultiplierValues = existingMultiplierValues.concat(multiplierValuesToAppend);

        mergedMultiplierValues.sort();
        existingObject.multiplier = [_.uniq(mergedMultiplierValues).join(",")];
      }
    }

    transformedV = { ...v, rows: [...resRows, ...rowsWithoutMultipliers] };
  } else {
    transformedV = { ...v, rows: [...rowsWithoutMultipliers] };
  }

  return transformedV;
}

export function optimizeSymptomValue(v: Symptom.Value, state: State.Root): Symptom.Value {
  const { rows } = v;

  rows.forEach(row => {
    const { multiplier, modifierValues } = row;

    // convert all multiplier values into multiplier rows
    if (multiplier) {
      const multiplierValue = multiplier[0];
      let splitValue;

      if (typeof multiplierValue !== "string") return;

      splitValue = multiplierValue.split(",");
      splitValue.splice(1).forEach(val => {
        rows.push({ ...row, multiplier: [val] });
      });
      row.multiplier = [splitValue[0]];
    }

    // convert modifier ranges into rows
    if (modifierValues && modifierValues.length) {
      const timeRanges = validTimeRanges(state);

      modifierValues.forEach(modifier => {
        const { scale, name } = modifier;

        if (name.toLowerCase() === "time" && scale) {
          const timeFrameArray = scale.timeFrame && scale.timeFrame.split(",");

          for (let i = 0; i < timeFrameArray.length; i++) {
            const timeFrame = timeFrameArray[i];
            const range = timeRanges[timeFrame];

            if (i === 0) {
              scale.timeFrame = timeFrame;
            } else {
              range && modifierValues.push({ ...modifier, scale: { ...scale, timeFrame } });
            }
          }
        }
      })
    }
  });

  return v;
}
