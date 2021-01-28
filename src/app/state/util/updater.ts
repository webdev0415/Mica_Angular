import { defaultState } from "../../app.config";
import * as _ from "lodash";

  /**
   * Detect semantic version
   * Return name of changed part or empty string
   */
export function  isVersionOld(state: State.Root): MICA.SemanticVersioning[] {
    const semantic: MICA.SemanticVersioning[] = ["major", "minor", "patch"];
    return getChangedPart([...defaultState.global.version.split("."), ...state.global.version.split(".")], semantic);
}

export function getChangedPart(parts: String[], semantic: MICA.SemanticVersioning[]): MICA.SemanticVersioning[] {
  const [majorD, minorD, patchD, major, minor, patch] = parts;
  if (majorD > major) return semantic;
  if (minorD > minor) return _.takeRight(semantic, 2);
  if (patchD > patch) return _.takeRight(semantic, 1);
  return [];
}

export function updateErrorState(sympError: Symptom.ValueError, state: Task.ActiveIllnessError) {
  const sgErrorsList = [...(state.symptoms[sympError.groupID] || [])];
  let sympErrIndex = _.findIndex(sgErrorsList, {"symptomID": sympError.symptomID});
  const errExists = !!~sympErrIndex;

  if (!errExists) {
    // add new error to list
    sgErrorsList.push(sympError);
    sympErrIndex = _.findIndex(sgErrorsList, {"symptomID": sympError.symptomID});
  } else {
    // merge without overriding depending on whether it's a root or row error
    sgErrorsList[sympErrIndex] = {
      ...sgErrorsList[sympErrIndex],
      bodyParts: sympError.bodyParts || sgErrorsList[sympErrIndex].bodyParts,
      rowErrors: sympError.rowErrors || sgErrorsList[sympErrIndex].rowErrors
    }
  }

  // remove if no errors
  const sympErrorRecord = sgErrorsList[sympErrIndex];
  const shouldBeRemoved = (!sympErrorRecord.bodyParts || _.isEmpty(sympErrorRecord.bodyParts))
    && (!sympErrorRecord.rowErrors || !sympErrorRecord.rowErrors.length);
  if (shouldBeRemoved) sgErrorsList.splice(sympErrIndex, 1);

  // remove symptom group if empty
  return {
    ...state,
    symptoms: sgErrorsList.length
      ? {...state.symptoms, [sympError.groupID]: sgErrorsList}
      : _.omit(state.symptoms, sympError.groupID)
  };
}

export default {
  isVersionOld: isVersionOld
};
