import ModifierValue = Symptom.ModifierValue;
import ScaleValue = Symptom.ScaleValue;

// export function getIllnessData(idIcd10Code: string, state: State.Root) {
//   return _.find(taskSelectors.savedData(state), {"idIcd10Code": idIcd10Code});
// }

// export function getSymptomsInIllness(illness: Illness.FormValue): Symptom.Value[] {
//   return _.reduce(illness.symptomGroups, (ss: Symptom.Value[], sg) => {
//     const sgs = _.reduce(getCatValueSGAll(sg), (result: Symptom.Value[], cat) => {
//       return _.concat(result, cat.symptoms);
//     }, []);
//     return _.concat(ss, sgs);
//   }, []);
// }

export interface TimeRange {
  count: number,
  name: string,
  startCount?: number
}

/**
 * Return all categories flatten, regardless of whether or not SG has sections
 */
// function getCatValueSGAll(sgValue: Illness.FormValueSymptomGroup): Illness.FormValueCategory[] {
//   return (sgValue.categories || _.flatMap(sgValue.sections, "categories")) as Illness.FormValueCategory[];
// }


/**
 * Factories for illnesses and objects in them
 */

export function symptomGroupValueFactory(groupID: string, isDeep: boolean): Illness.Normalized.SymptomGroup {
  return isDeep
    ? { groupID, sections: [] } as Illness.Normalized.SymptomGroupDeep
    : { groupID, categories: [] } as Illness.Normalized.SymptomGroupBasic
}

export function sectionValueFactory(sectionID: string): Illness.Normalized.FormValueSection {
  return { sectionID, categories: [] }
}

export function categoryValueFactory(categoryID: string): Illness.Normalized.FormValueCategory {
  return { categoryID, symptoms: [] }
}

// export function illnessValueFactory(name: string, idIcd10Code: string, version: number, state: Illness.State): Illness.FormValue {
//   return {
//       name,
//       idIcd10Code,
//       groupsComplete: [],
//       state,
//       version,
//       symptomGroups: []
//     };
// }

/**
 * Parsers
 */

/**
 * Transform category data into a valid object for a FormGroup
 */
// function catToFormValueCat(cats: Workbench.Category[]): Illness.FormValueCategory[] {
//   return _.map(cats, cat => {
//     return {
//       categoryID: cat.categoryID,
//       symptoms: []
//     };
//   });
// }

export const getSelectedRanges = (
  modifierValues: ModifierValue[],
  validTimeRanges: { [k: string]: TimeRange }
): { [likelihood: string]: { [timeFrame: string]: TimeRange } } => {

  const selectedRanges: { [likelihood: string]: { [timeFrame: string]: TimeRange } } = {};

  for (let i = 0; i < modifierValues.length; i++) {
    const modifierValue: ModifierValue = modifierValues[i];

    if (modifierValue.name.toLowerCase() === "time") {
      const scale: ScaleValue = <ScaleValue>modifierValue.scale;
      const likelihood = modifierValue.likelihood;

      if (likelihood && scale) {
        const timeFrameArray = scale.timeFrame && scale.timeFrame.split(",");
        const likelihoodPool = selectedRanges[likelihood] || {};

        timeFrameArray && timeFrameArray.forEach(timeFrame => {
          if (!timeFrame) return;

          const isCached = !!likelihoodPool[timeFrame];
          const range = validTimeRanges[timeFrame];

          if (range && !isCached) {
            likelihoodPool[timeFrame] = range;
          }
        });

        selectedRanges[likelihood] = likelihoodPool;
      }
    }
  }

  return selectedRanges;
};

export const rangeExists = (
  timeRanges: TimeRange[],
  invert: boolean,
  rangeToSkip: TimeRange | null,
  timeRange: TimeRange
): boolean => {
  let exists = false;

  for (let i = 0; i < timeRanges.length; i++) {
    const currentTimeRange = timeRanges[i];
    if (rangeToSkip && areRangesEqual(currentTimeRange, rangeToSkip)) {
      continue;
    }
    exists = areRangesEqual(timeRange, currentTimeRange);
    if (exists) {
      return exists && !invert;
    }
  }
  return !exists && invert;
};

export const areRangesEqual = (rangeA: TimeRange, rangeB: TimeRange): boolean => {
  return rangeA.name.toUpperCase() === rangeB.name.toUpperCase();
};

export const findValidRange = (searchRange: TimeRange, validRanges: TimeRange[]): TimeRange | null => {
  for (let i = 0; i < validRanges.length; i++) {
    const validRange = validRanges[i];
    if (areRangesEqual(searchRange, validRange)) {
      return validRange;
    }
  }
  return null;
};
