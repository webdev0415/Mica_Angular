import { createSelector } from 'reselect';
import * as _ from 'lodash';
import * as navSelectors from 'app/state/nav/nav.selectors';
import * as symptomSelectors from 'app/state/symptoms/symptoms.selectors';
import { denormalizeIllnessValue } from 'app/state/denormalized.model';
import { inconsistentModelMsgs } from 'app/util/forms/validators';

const workbenchSelector = (state: State.Root) => state.workbench;
export const illnessValuesDict = (state: State.Root) => state.workbench.illnesses.values;
export const activeIllnessErrors = (state: State.Root) => state.workbench.errors;
export const mandatorySymptoms = (state: State.Root) => state.workbench.mandatorySymptoms;
export const activeIllnessID = (state: State.Root) => state.workbench.illnesses.active;
const activeSymptomGroup = (state: State.Root) => navSelectors.activeSymptomGroup(state);
const activeSectionSelector = (state: State.Root) => navSelectors.activeSectionID(state);
const symptomItemsIDs = (state: State.Root) => navSelectors.symptomItemsIDs(state);
const templateEntities = (state: State.Root) => symptomSelectors.entities(state);


export const readOnlyIllness = createSelector(
  workbenchSelector,
  w => w.readOnlyIllness
);

export const readOnlyIllnessID = createSelector(
  readOnlyIllness,
  illness => illness ? illness.form.idIcd10Code : ''
);

export const activeIllnessValue = createSelector(
  readOnlyIllness,
  activeIllnessID,
  illnessValuesDict,
  (readOnly, illnessID, values): Illness.Normalized.IllnessValue | undefined => {
    return illnessID ? readOnly || values[illnessID] : undefined;
  }
);

export const currentIllness = createSelector(
  activeIllnessID,
  illnessValuesDict,
  (illnessID, values): Illness.Normalized.IllnessValue | undefined => {
    return illnessID ? values[illnessID] : undefined;
  }
);

export const activeIllnessValueDenorm = createSelector(
  readOnlyIllness,
  activeIllnessID,
  illnessValuesDict,
  (readOnly, illnessID, values) => {
    return illnessID ? denormalizeIllnessValue(readOnly || values[illnessID]) : undefined;
  }
);


export const illnessValue = (idIcd10Code: string, version: number) => createSelector(
  illnessValuesDict,
  readOnlyIllness,
  (illnesses, readOnlyValue) => {
    const illKey = `${idIcd10Code}v${version}`;
    return (
      illnesses[illKey] ? illnesses[illKey] :
        readOnlyValue && readOnlyValue.form.idIcd10Code === idIcd10Code && readOnlyValue.form.version === version
          ? readOnlyValue : undefined
    )
  }
);

export const illnessInconsistentMsgs = (idIcd10Code: string, version: number) => createSelector(
  illnessValue(idIcd10Code, version),
  templateEntities,
  (illness, templates) => {
    if (!illness) {
      return [];
    } else {
      return inconsistentModelMsgs(_.cloneDeep(illness), templates);
    }
  }
);

export const illnessValues = createSelector(
  illnessValuesDict,
  illnesses => _.values(illnesses)
);

/**
 * Symptom groups
 */

export const symptomGroupsCompleteValue = createSelector(
  activeIllnessValue,
  illness => illness ? illness.form.groupsComplete : []
);

export const isSymptomGroupComplete = (groupID: string) => createSelector(
  symptomGroupsCompleteValue,
  (complete) => !!~_.indexOf(complete, groupID)
);

export const readOnlySymptomGroupsCompleteValue = createSelector(
  readOnlyIllness,
  illness => illness ? illness.form.groupsComplete : []
);

export const isReadOnlySymptomGroupComplete = (groupID: string) => createSelector(
  readOnlySymptomGroupsCompleteValue,
  (complete) => !!~_.indexOf(complete, groupID)
);

export const isSymptomGroupActiveComplete = createSelector(
  activeSymptomGroup,
  symptomGroupsCompleteValue,
  (sg, complete) => !!~_.indexOf(complete, sg)
);

export const areSymptomGroupsComplete = createSelector(
  activeIllnessValue,
  symptomItemsIDs,
  (illness, paths) => {
    return illness ? _.every(paths, p => !!~_.indexOf(illness.form.groupsComplete, p)) : false;
  }
);

export const symptomGroupValues = createSelector(
  activeIllnessValue,
  illness => illness ? _.values(illness.entities.symptomGroups) : []
);

export const symptomGroupValue = (groupID: string) => createSelector(
  activeIllnessValue,
  illness => illness
    ? illness.entities.symptomGroups[groupID]
    : undefined
);

export const readOnlySymptomGroupValue = (groupID: string) => createSelector(
  readOnlyIllness,
  illness => illness
    ? illness.entities.symptomGroups[groupID]
    : undefined
);

/* istanbul ignore next */
const categoriesWithSymptoms = (cats: string[], illness: Illness.Normalized.IllnessValue) => (
  _.reduce(cats, (acc, id) => (
    illness.entities.categories[id].symptoms.length
      ? acc.concat(illness.entities.categories[id])
      : acc
  ),       [] as Illness.Normalized.FormValueCategory[])
);

export const symptomGroupCatValue = (groupID: string) => createSelector(
  activeIllnessValue,
  symptomGroupValue(groupID),
  (illness, sg) => {
    if (!illness || !sg) {
      return undefined;
    } else {
      return sg.categories
        ? categoriesWithSymptoms(sg.categories, illness)
        : _.flatMap(_.map(sg.sections, s => (
          categoriesWithSymptoms(illness.entities.sections[s].categories, illness)
        ))) as Illness.Normalized.FormValueCategory[];
    }
  }
);

export const readOnlySymptomGroupCatValue = (groupID: string) => createSelector(
  readOnlyIllness,
  readOnlySymptomGroupValue(groupID),
  (illness, sg) => {
    if (!illness || !sg) {
      return undefined;
    } else {
      return sg.categories
        ? categoriesWithSymptoms(sg.categories, illness)
        : _.flatMap(_.map(sg.sections, s => (
          categoriesWithSymptoms(illness.entities.sections[s].categories, illness)
        ))) as Illness.Normalized.FormValueCategory[];
    }
  }
);

export const activeSymptomGroupValue = createSelector(
  activeSymptomGroup,
  activeIllnessValue,
  (sg, illness) => illness ? illness.entities.symptomGroups[sg] : undefined
);

// checks whether active group has any symptom added
export const activeSymptomGroupHasAnySymptoms = createSelector(
  activeSymptomGroup,
  activeIllnessValue,
  (groupID, illness) => {
    if (!illness) {
      return false;
    }
    const symptomGroups = illness.entities.symptomGroups;
    const symptomGroupNames = Object.keys(symptomGroups);
    const categories = illness.entities.categories;
    for (let i = 0; i < symptomGroupNames.length; i++) {
      const symptomGroupName = symptomGroupNames[i];
      const currentGroup = illness.entities.symptomGroups[symptomGroupName];
      const currentGroupCategories = currentGroup.categories || [];
      for (let j = 0; j < currentGroupCategories.length; j++) {
        const currentGroupCategory = currentGroupCategories[j];
        const symptomsCount = categories[currentGroupCategory].symptoms.length;
        if (symptomsCount > 0) {
          return true;
        }
      }
    }
    return false;
  }
);

/**
 * Section
 */

export const sectionValue = (sectionID: string) => createSelector(
  activeIllnessValue,
  illness => illness ? illness.entities.sections[sectionID] : undefined
);

export const readOnlySectionValue = (sectionID: string) => createSelector(
  readOnlyIllness,
  illness => illness ? illness.entities.sections[sectionID] : undefined
);

export const activeSectionValue = createSelector(
  activeIllnessValue,
  activeSectionSelector,
  (illness, sectionID) => illness ? illness.entities.sections[sectionID] : undefined
);

export const sectionCatsIDs = (sectionID: string) => createSelector(
  sectionValue(sectionID),
  section => section ? section.categories : [] as string[]
);

export const activeSectionCatsValue = createSelector(
  activeIllnessValue,
  activeSectionValue,
  (illness, section) => {
    if (!illness) {
      return [];
    } else {
      return section ? _.map(section.categories, id => illness.entities.categories[id]) : [];
    }
  }
);

export const sectionCatsValue = (sectionID: string) => createSelector(
  activeIllnessValue,
  sectionValue(sectionID),
  (illness, section) => {
    if (!illness) {
      return []
    } else {
      return section ? _.map(section.categories, id => illness.entities.categories[id]) : [];
    }
  }
);

export const readOnlySectionCatsValue = (sectionID: string) => createSelector(
  readOnlyIllness,
  readOnlySectionValue(sectionID),
  (illness, section) => {
    if (!illness) {
      return []
    } else {
      return section ? _.map(section.categories, id => illness.entities.categories[id]) : [];
    }
  }
);

/**
 * Category
 */

export const activeCategoryValue = (categoryID: string) => createSelector(
  activeIllnessValue,
  (illness) => illness ? illness.entities.categories[categoryID] : undefined
);

export const catValueAll = createSelector(
  activeIllnessValue,
  illness => illness ? _.values(illness.entities.categories) : []
);

export const categoryValue = (categoryID: string) => createSelector(
  activeIllnessValue,
  illness => illness ? illness.entities.categories[categoryID] : undefined
);

export const readOnlyCategoryValue = (categoryID: string) => createSelector(
  readOnlyIllness,
  illness => illness ? illness.entities.categories[categoryID] : undefined
);

/**
 * Symptom
 */

export const symptomValue = (symptomID: string) => createSelector(
  activeIllnessValue,
  (illness) => {
    return illness ? illness.entities.symptoms[symptomID] : undefined
  }
);

export const symptomsInCatIDs = (categoryID: string) => createSelector(
  categoryValue(categoryID),
  cat => cat ? cat.symptoms : []
);

export const symptomsInCatValue = (categoryID: string) => createSelector(
  activeIllnessValue,
  categoryValue(categoryID),
  (illness, cat) => {
    return cat && illness ? _.map(cat.symptoms, id => illness.entities.symptoms[id]) : []
  }
);

export const readOnlySymptomsInCatValue = (categoryID: string) => createSelector(
  readOnlyIllness,
  readOnlyCategoryValue(categoryID),
  (illness, cat) => {
    return cat && illness ? _.map(cat.symptoms, id => illness.entities.symptoms[id]) : []
  }
);

/**
 * Validation
 */

export const activeMandatorySymptoms = createSelector(
  activeSymptomGroup,
  mandatorySymptoms,
  (sg, ms) => ms[sg]
);

export const hasMissingMandatorySymptoms = createSelector(
  activeMandatorySymptoms,
  activeIllnessValue,
  (ms, value) => {
    if (!ms || !value) {
      return false;
    }
    const symptoms = value.entities.symptoms;
    const symptomIds = Object.keys(symptoms);
    const symptomsHavingBasic = Object.keys(ms);
    return symptomIds.some(symptomId => symptomsHavingBasic.indexOf(symptomId) > -1 && !symptoms[ms[symptomId]]);
  }
);

export const isActiveSymptomGroupValid = createSelector(
  activeSymptomGroup,
  activeIllnessErrors,
  hasMissingMandatorySymptoms,
  (sg, errors, ms) => !_.has(errors.symptoms, sg) && !ms
);

// export const isSymptomGroupValid = (groupID: string) => createSelector(
//   activeIllnessErrors,
//   errors => !_.get(errors, groupID)
// )

export const areSymptomGroupsValid = createSelector(
  activeIllnessErrors,
  errors => errors.symptoms && _.isEmpty(errors.symptoms)
);

export const isIllnessRootValid = createSelector(
  activeIllnessErrors,
  errors => errors.illness && _.isEmpty(errors.illness)
);

export const isActiveIllnessValid = createSelector(
  areSymptomGroupsValid,
  isIllnessRootValid,
  (s, i) => {
    return s && i;
  }
);

export const isActiveIllnessHasSymptoms = createSelector(
  activeIllnessValue,
  (illness) => illness ? !!Object.keys(illness.entities.symptoms).length : undefined
);
