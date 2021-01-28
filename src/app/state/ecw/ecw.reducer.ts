import {ecwInit} from "./../../app.config";
import {Reducer, combineReducers, Action} from "redux";
import * as _ from "lodash";
import {categorySchema, illnessValueSchema, normalizeIllness} from "../denormalized.model";
import * as EcwActions from "./ecw.actions";
import {normalize} from "normalizr";


const ecwActiveIllness: (state: ECW.Illness, action: EcwActions.ecwAction) => ECW.Illness =
  (state = ecwInit.active, action) => {
    switch (action.type) {
      case EcwActions.SET_ECW_ACTIVE_ILLNESS:
        const {illness} = action;
        return (illness.icd10Code !== state.icd10Code) ? {...state, ...illness} : state;
      default:
        return state;
    }
  }
const ecwParams: (state: ECW.Params, action: EcwActions.ecwAction) => ECW.Params =
  (state = ecwInit.params, action) => {
    switch (action.type) {
      case EcwActions.SET_ECW_PARAMS:
        const {params} = action;
        return {...state, ...params};
      default:
        return state;
    }
  }

const ecwIllnesses: (state: State.EcwIllnesses, action: EcwActions.ecwAction) => State.EcwIllnesses =
  (state = ecwInit.illnesses, action) => {
    switch (action.type) {
      case EcwActions.SET_ECW_ACTIVE_ILLNESS:
        return {
          ...state,
          active: action.illness.icd10Code
        }

      case EcwActions.UPSERT_ECW_ILLNESS:
        const IllnessData = action.IllnessData
        return {
          ...state,
          values: {
            ...state.values,
            [IllnessData.idIcd10Code]: normalizeIllness(IllnessData)
          }
        };

      case EcwActions.DELETE_ECW_SYMPTOM:
        console.log("action.categoryID, action.symptomID");
        console.log(action.categoryID, action.symptomID);

        const activeValueID = state.active;
        const activeValue = state.values[activeValueID];

        const categoriesD = {
          ...activeValue.entities.categories,
          [action.categoryID]: {
            ...activeValue.entities.categories[action.categoryID],
            symptoms: _.without(
              activeValue.entities.categories[action.categoryID].symptoms,
              action.symptomID)
          }
        };
        const prunedIllness: Illness.Normalized.IllnessValue = {
          form: activeValue.form,
          entities: {
            ...activeValue.entities,
            categories: categoriesD,
            symptoms: _.omit(activeValue.entities.symptoms, action.symptomID)
          }
        }
        return {
          ...state,
          values: {
            ...state.values,
            [prunedIllness.form.idIcd10Code]: prunedIllness
          }
        }

      default:
        return state;
    }
  }

const ecwValidation: (state: ECW.Validation, action: EcwActions.ecwAction) => ECW.Validation =
  (state = ecwInit.validation, action) => {
    switch (action.type) {
      case EcwActions.SET_ECW_VALIDATION_ILLNESS: {
        const ecwIll = action.ecwIllness;
        const activeIll = action.activeIllness;
        const nlpIll = action.nlpIllness;
        const getMissingData = (
          activeIllness: Illness.Normalized.IllnessValue,
          ecwOrNlpIllness: ECW.IllnessData | null,
          currMissingData: { [idx: string]: { [idx: string]: Illness.Normalized.FormValueCategory } }) => {
          if (!ecwOrNlpIllness) {
            return currMissingData;
          }
          _.forEach(ecwOrNlpIllness.symptomGroups, sg => {
            const cats = activeIllness.entities.categories;
            let ecwCats = sg.categories || [];
            const ecwSections = sg.sections;
            _.forEach(ecwSections, sec => ecwCats = [...ecwCats, ...sec.categories]);
            currMissingData[sg.groupID] = _.reduce(ecwCats, (diff, cat) => {
              const normalizedEcw = normalize(cat, categorySchema);
              const normalizedEcwCat = normalizedEcw.entities.categories[cat.categoryID];
              const categoryID = normalizedEcwCat.categoryID;
              const originalCat = _.find(cats, {categoryID}) as Illness.Normalized.FormValueCategory;
              if (originalCat) {
                const missingSymptoms = _.difference(normalizedEcwCat.symptoms, originalCat.symptoms);
                if (missingSymptoms.length) diff[normalizedEcwCat.categoryID] = {...normalizedEcwCat, symptoms: missingSymptoms};
              } else if (normalizedEcwCat.symptoms.length) {
                diff[normalizedEcwCat.categoryID] = normalizedEcwCat;
              }
              return diff;
            }, {} as { [idx: string]: Illness.Normalized.FormValueCategory });
          });
          return currMissingData;
        };
        const ecwMissingData = getMissingData(activeIll, ecwIll, {});
        const nlpMissingData = getMissingData(activeIll, nlpIll, {});
        const ecwAndNlpMissingData = _.mergeWith(nlpMissingData, ecwMissingData, mergeCustomizer);
        // const ecwIllNormalized = ecwIll && normalize(ecwIll, illnessValueSchema);
        const nlpIllNormalized = nlpIll && normalize(nlpIll, illnessValueSchema);

        if (!_.isEmpty(ecwAndNlpMissingData)) {
          return {
            ...state,
            illness: ecwIll || nlpIll,
            symptoms: nlpIllNormalized && nlpIllNormalized.entities.symptoms,
            missingData: ecwAndNlpMissingData
          } as ECW.Validation;
        } else {
          return {
            ...state,
            illness: null,
            missingData: null
          } as ECW.Validation;

        }
      }

      case EcwActions.REMOVE_ECW_VALIDATION_SYMPTOM: {
        const {symptomID, categoryID, groupID} = action;
        const missingData = _.cloneDeep(state.missingData);
        if (missingData) {
          const group = missingData[groupID];
          const cat = group && group[categoryID];
          if (cat) {
            cat.symptoms = _.without(cat.symptoms, symptomID);
            if (!cat.symptoms || !cat.symptoms.length) missingData[groupID] = _.omit(group, categoryID);
          }
        }
        return {
          ...state,
          missingData
        };
      }

      case EcwActions.ADD_ECW_VALIDATION_SYMPTOM: {
        const {symptomID, categoryID, groupID} = action;
        const illness = state.illness;
        const missingData = _.cloneDeep(state.missingData);
        if (illness && missingData) {
          const illGroup = _.find(illness.symptomGroups, {groupID});
          const illCat = illGroup && _.find(illGroup.categories, {categoryID});
          const illSymptomExists = illCat && !!_.find(illCat.symptoms, {symptomID});
          const dataGroup = missingData[groupID];
          let dataCat = (dataGroup && dataGroup[categoryID]) || {categoryID, symptoms: []};

          dataGroup[categoryID] = dataCat;

          if (illSymptomExists && dataCat) dataCat.symptoms.push(symptomID);
        }
        return {
          ...state,
          missingData
        };
      }

      default:
        return state;
    }
  };

export const mergeCustomizer = (objectA: any, objectB: any) => {
  if (_.isArray(objectA)) {
    return _.union(objectA, objectB);
  }
};

const ecwReducer: Reducer<State.ECW> = combineReducers<State.ECW>({
  active: ecwActiveIllness,
  params: ecwParams,
  illnesses: ecwIllnesses,
  validation: ecwValidation
});

export default ecwReducer;
