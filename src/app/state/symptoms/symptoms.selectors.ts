import * as navSelectors from './../nav/nav.selectors';
import { createSelector } from 'reselect';
import * as _ from 'lodash';
import { denormalize } from 'normalizr';
import { categorySchema } from '../denormalized.model';
import DataStoreRefTypeValue = Workbench.DataStoreRefTypeValue;
import DataStoreRefTypesDictionary = Workbench.DataStoreRefTypesDictionary;
import { TimeRange } from '../../util/data/illness';

const symptomsSelector = (state: State.Root) => state.symptoms;
const activeSectionSelector = (state: State.Root) => navSelectors.activeSectionID(state);
const activeSymptomGroup = (state: State.Root) => navSelectors.activeSymptomGroup(state);
const activeCategoryID = (state: State.Root) => navSelectors.activeCategoryID(state);
const symptomItemsIDs = (state: State.Root) => navSelectors.symptomItemsIDs(state);
export const entities = (state: State.Root) => state.symptoms.entities;
export const nlpSymptoms = (state: State.Root) => state.symptoms.nlpSymptoms;

export const activeSymptomGroupData = createSelector(
  activeSymptomGroup,
  entities,
  (sg, es) => es.symptomGroups[sg]
);

// NLP Symptoms
export const nlpGroupIsActive = createSelector(
  activeSymptomGroup,
  symptomGroup => symptomGroup === 'nlp'
);

export const nlpSymptomsPage = createSelector(
  nlpSymptoms,
  nlp => nlp.page
);

export const totalNlpSymptoms = createSelector(
  nlpSymptoms,
  nlp => nlp.total
);

export const currentNlpSymptoms = createSelector(
  nlpSymptoms,
  (nlp) => nlp.currentSearch
);

export const cachedNlpSymptoms = createSelector(
  nlpSymptoms,
  (nlp) => nlp.cachedSymptoms
);

export const cachedNlpSymptomsArr = createSelector(
  cachedNlpSymptoms,
  (cachedSymptoms) => Object.values(cachedSymptoms)
);

export const nlpSymptomData = (code: string) => createSelector(
  cachedNlpSymptoms,
  (cachedSymptoms) => cachedSymptoms[code]
);
// END NLP Symptoms

export const symptomGroupDataLoaded = createSelector(
  symptomItemsIDs,
  entities,
  (ids, es) => {
    return ids.length === _.keys(es.symptomGroups).length
      && _.every(ids, id => _.indexOf(_.keys(es.symptomGroups), id) > -1);
  }
);

export const symptomGroupData = (groupID: string) => createSelector(
  entities,
  es => es.symptomGroups[groupID]
);

/* istanbul ignore next */
export const symptomGroupVersions = createSelector(
  entities,
  es => _.reduce(es.symptomGroups, (acc, sg, name) => {
    acc[name] = sg.updatedDate;
    return acc;
  },             {} as { [key: string]: number })
);

/**
 * Section
 */

export const sectionDataAll = createSelector(
  entities,
  es => es.sections
);

export const activeSectionData = createSelector(
  activeSectionSelector,
  sectionDataAll,
  (sectionID, sections) => sections[sectionID]
);

export const activeSectionCatsData = createSelector(
  activeSectionData,
  section => section ? section.categories : []
);

export const sectionData = (sectionID: string) => createSelector(
  sectionDataAll,
  sections => sections[sectionID]
);

export const sectionNameFromID = (sectionID: string) => createSelector(
  sectionData(sectionID),
  section => section ? section.name : ''
);

export const sectionIDFromName = (name: string) => createSelector(
  sectionDataAll,
  ss => {
    const match = _.find(_.values(ss), {name});
    return match ? match.sectionID : '';
  }
);

/**
 * Categories
 */

export const catDataAll = createSelector(
  entities,
  es => es.categories
);

export const catNameFromID = (categoryID: string) => createSelector(
  catDataAll,
  cats => {
    const cat = cats[categoryID];
    // if (!cat) throw new Error(("Unable to find category name for " + categoryID));
    return cat ? cat.name : '';
  }
);

export const catIDFromName = (name: string, section?: string) => createSelector(
  activeSymptomGroup,
  entities,
  (sg, es) => {
    const catIDs = section
      ? es.sections[section].categories
      : es.symptomGroups[sg].categories;
    const cats = _.map(catIDs, id => es.categories[id]);
    const match = _.find(cats, {name});
    if (!match) throw Error('Unable to find ID from category name: ' + name);
    return match.categoryID;
  }
);

export const catData = (categoryID: string) => createSelector(
  catDataAll,
  cats => cats[categoryID]
);

export const activeCatData = createSelector(
  catDataAll,
  activeCategoryID,
  (cats, id) => cats[id]
);

export const catDataDenormalized = (categoryID: string) => createSelector(
  entities,
  es => denormalize(es.categories[categoryID], categorySchema, es) as Workbench.Category
);

/**
 * Symptoms
 */

export const symptomData = (symptomID: string) => createSelector(
  symptomsDataAll,
  ss => ss[symptomID]
);

export const symptomDataMany = (symptomIDs: any) => createSelector(
  symptomsDataAll,
  ss => _.map(symptomIDs, id => ss[id])
);

export const symptomsDataAll = createSelector(
  entities,
  es => es.symptoms
);

export const activeSymptomsIDs = createSelector(
  activeCatData,
  cat => cat ? cat.symptoms : []
);

export const symptomsInCatIDs = (catID: string) => createSelector(
  activeCatData,
  cat => cat.symptoms
);

/* istanbul ignore next */
export const symptomsInCatData = (catID: string) => createSelector(
  catDataDenormalized(catID),
  cachedNlpSymptomsArr,
  (cat, nlpSyms) => catID === 'SYMPTCG33'
    ? {...cat.symptoms, ...nlpSyms}
    : cat.symptoms
);

// export const activeDataStoreRefTypes = createSelector(
//   activeSymptomGroupData,
//   sg => sg.dataStoreRefTypes
// )

/**
 * If no symptom group ID provided, active symptom group will be considered
 */
export const symptomDataPath = (symptomID: string, groupID?: string | null, isNlp?: boolean | null) => {
  return createSelector(
    entities,
    cachedNlpSymptomsArr,
    (es, nlpSympts) => {
      const catData = isNlp
        ? {
          categoryID: 'SYMPTCG33',
          name: 'Core Symptoms',
          symptoms: nlpSympts
        } : _.find(es.categories, cat => !!~_.indexOf(cat.symptoms, symptomID));
      const section = catData
        ? _.find(es.sections, s => !!~_.indexOf(s.categories, catData.categoryID))
        : undefined;
      const symptomGroup = catData
        ? _.find(es.symptomGroups, group => !!~_.indexOf(group.categories, catData.categoryID))
        : undefined;
      let symptomGroupID = symptomGroup ? symptomGroup.groupID : '';
      if (!symptomGroupID && section) {
        const sg = _.find(es.symptomGroups, group => !!~_.indexOf(group.sections, section.sectionID))
        symptomGroupID = sg ? sg.groupID : '';
      }
      const symptom = es.symptoms[symptomID];
      const subGroups = symptom && symptom.subGroups;
      const path: Symptom.LocationData = {
        symptomGroup: groupID || symptomGroupID,
        sectionID: section ? section.sectionID : '',
        categoryID: catData ? catData.categoryID : '',
        categoryName: catData ? catData.name : '',
        viewName: subGroups && subGroups[0] || null,
        symptomID
      };
      return path;
    }
  )
};

export const symptomNameFromID = (symptomID: string) => createSelector(
  symptomsDataAll,
  (ss) => {
    const s = ss[symptomID];
    if (!s) console.error('Unable to find symptom name from ID ' + symptomID);
    return s ? s.name : '';
  }
);

export const findSymptomLive = (term: string) => createSelector(
  symptomsDataAll,
  ss => {
    const t = term.trim().replace(/\s\s+/g, ' ').toUpperCase();
    return t
      ? _.filter(_.values(ss), s => {
        const name = s.name.replace(/\s\s+/g, ' ').toUpperCase();
        return name.includes(t) || s.symptomID.includes(t)
      })
      : []
  }
);

/**
 * Finds symptom
 * Returns symptoms which name, symptomID, or any list values matches the term
 * @param {string} t
 * @returns {OutputSelector<any, Symptom.Data[], (res1: any, res2: any) => Symptom.Data[]>}
 */
export const findSymptomEnhanced = (t: string) => createSelector(
  symptomsDataAll,
  allDataStoreRefTypes,
  (symptomsData, allRefTypes) => {
    const addSymptoms = (
      symptom: Symptom.Data,
      symptoms: Symptom.Data[],
      refTypes: DataStoreRefTypesDictionary,
      term: string,
      symptomMatch: boolean
    ) => {
      if (symptomMatch) {
        symptoms.push(symptom);
      } else {
        // check whether term matches any list values
        const multipleValues = symptom.multipleValues;
        const refType = multipleValues ? refTypes[multipleValues] : undefined;
        let listValues = refType ? refType.values : undefined;
        if (listValues && listValues.length) {
          listValues = _.filter(listValues, (value: DataStoreRefTypeValue) => value.name.toUpperCase().includes(term));
          const symptomRefTypes = _.sortBy(listValues, (value: DataStoreRefTypeValue) => value.name.toUpperCase());
          // include symptom for each matched list value, appending list value to symptom name
          for (let i = 0; i < symptomRefTypes.length; i++) {
            const symptomRefType = symptomRefTypes[i];
            const updatedSymptom = {...symptom};
            updatedSymptom.name = `${updatedSymptom.name} - ${symptomRefType.name}`;
            symptoms.push(updatedSymptom);
          }
        }
      }
    };
    const searchTerm = t.trim().replace(/\s\s+/g, ' ').toUpperCase();
    const symptomsValues = _.values(symptomsData);
    const resSymptoms: Symptom.Data[] = [];
    for (let j = 0; j < symptomsValues.length; j++) {
      const s = symptomsValues[j];
      const symptomName = s.name.replace(/\s\s+/g, ' ').toUpperCase();
      // include if term matches symptom name or symptom id
      const symptomNameOrIdMatches = symptomName.includes(searchTerm) || s.symptomID.includes(searchTerm);
      addSymptoms(s, resSymptoms, allRefTypes, searchTerm, symptomNameOrIdMatches);
    }
    return resSymptoms;
  }
);

/**
 * dataStoreRefTypes
 */

export const dataStoreRefTypes = createSelector(
  activeSymptomGroupData,
  sg => sg.dataStoreRefTypes
);

export const dataStoreRefTypesByGroup = (groupID: string) => createSelector(
  symptomGroupData(groupID),
  sg => sg.dataStoreRefTypes
);

export const allDataStoreRefTypes = createSelector(
  entities,
  es => _.reduce(
    es.symptomGroups,
    (result, symptomGroup) => ({ ...result, ...symptomGroup.dataStoreRefTypes }),
    <any>{}
  )
);

export const validTimeRanges = createSelector(
  allDataStoreRefTypes,
  refTypes => {
    const rangeRefType = refTypes['Timebucket'];
    const res: { [timeFrame: string]: TimeRange } = {};

    if (rangeRefType) {
      const ranges = rangeRefType.values;

      if (ranges) {
        ranges.forEach((range: any) => {
          res[range.name] = { name: range.name, count: range.displayOrder };
        })
      }
    }

    return res;
  }
);

export const externalMultiplierOptions = createSelector(
  symptomsSelector,
  s => s.multiplier.withExternalAPI
);

export const typeaheadItems = (name: string) => createSelector(
  symptomsSelector,
  s => s.multiplier.typeahead[name]
);

export const multiplierValues = (template: Symptom.Data) => createSelector(
  entities,
  es => {
    return !template ? undefined
      : _.reduce(_.values(es.symptomGroups), (result, sg) => {
        return result || _.get(sg, ['dataStoreRefTypes', template.multipleValues as string]);
      },         undefined) as Workbench.DataStoreRefType | undefined;
  }
);
