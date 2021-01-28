import { createSelector } from "reselect";
import * as _ from "lodash";

const illnessesSelector = (state: State.Root) => state.illnesses;

export const allIllnesses = createSelector(
  illnessesSelector,
  illnesses => illnesses.illnesses
);

export const findIllnesses = (icd10Code: string) => createSelector(
  allIllnesses,
  illnesses => _.filter(illnesses, illness => illness.icd10Code.indexOf(icd10Code.toUpperCase()) > -1)
);

export const illnessByIcd10Code = (icd10Code: string) => createSelector(
  allIllnesses,
  illnesses => _.find(illnesses, illness => illness.icd10Code === icd10Code.toUpperCase()) || {name: ""}
);

