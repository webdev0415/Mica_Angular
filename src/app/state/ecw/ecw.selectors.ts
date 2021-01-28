import { createSelector } from "reselect";
import * as _ from "lodash";
import { entities } from "../symptoms/symptoms.selectors";

const ecwSelector = (state: State.Root) => state.ecw;

export const activeEcwIllness = createSelector(
  ecwSelector,
  e => e.active
);

export const ecwValidation = createSelector(
  ecwSelector,
  e => e.validation
);

export const ecwValidationIllness = createSelector(
  ecwValidation,
  v => v.illness
);

export const ecwValidationMissingData = createSelector(
  ecwValidation,
  v => v.missingData
);

export const ecwValidationIsSgInvalid = (groupID: string) => createSelector(
  ecwValidationMissingData,
  d => {
    const group = d && d[groupID];
    return !!group && !!_.keys(group).length
  }
);

export const ecwValidationMissingSymptomsInCat = (groupID: string, catID: string) => createSelector(
  ecwValidationMissingData,
  entities,
  (d, e) => {
    const g = d && d[groupID];
    const c = g && g[catID];
    let ss = c && c.symptoms ? c.symptoms : [];
    ss = ss.filter(s => !!e.symptoms[s]);
    return _.map(ss, s => {
      const symptomValue = e.symptoms[s];
      return symptomValue && {...symptomValue, isMissing: true}
    })
  }
);

export const activeEcwIllnessID = createSelector(
  activeEcwIllness,
  i => i.icd10Code
);

export const activeEcwIllnessValues = createSelector(
  ecwSelector,
  activeEcwIllnessID,
  (v, id) => v.illnesses.values[id]
);

export const symptomGroupsFromActiveIllness = createSelector(
  activeEcwIllnessValues,
  v => v.entities.symptomGroups
);

export const sectionsFromActiveIllness = createSelector(
  activeEcwIllnessValues,
  v => v.entities.sections
);

export const categoriesFromActiveIllness = createSelector(
  activeEcwIllnessValues,
  v => v.entities.categories
);

export const symptomsFromActiveIllness = createSelector(
  activeEcwIllnessValues,
  v => v.entities.symptoms
);

export const ecwValidationIllnessSg = (groupID: string) => createSelector(
  ecwValidationIllness,
  i => i && _.find(i.symptomGroups, {groupID})
);

export const ecwValidationSgCats = (groupID: string) => createSelector(
  ecwValidationIllnessSg(groupID),
  sg => sg && sg.categories
);

export const nlpValidationSymptoms = createSelector(
  ecwValidation,
  v => v.symptoms
);

export const validationSymptomByID = (symptomID: string) => createSelector(
  nlpValidationSymptoms,
  ss => ss && ss[symptomID]
);
