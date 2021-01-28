import { workbenchInit } from "app/app.config";
import { Reducer, combineReducers } from "redux";
import * as WorkbenchActions from "./workbench.actions";
import { normalizeIllness } from "../denormalized.model";
import * as _ from "lodash";
import * as illnessValue from "app/util/data/illness";
import { updateErrorState } from "../util/updater";

const emptyIllnessValueFactory = (idIcd10Code: string, name: string, version: number, state: Illness.State): Illness.Normalized.IllnessValue => ({
  entities: {
    categories: {},
    sections: {},
    symptoms: {},
    symptomGroups: {}
  },
  form: {
    name: name,
    state: state,
    idIcd10Code: idIcd10Code,
    version: version,
    groupsComplete: [],
    symptomGroups: []
  }
});

const addIfNotExists = <T>(value: T, list: T[] | undefined): T[] => {
  const set = list ? new Set(list) : new Set();
  set.add(value);
  /* istanbul ignore next */
  // @ts-ignore
  return !list || set.size !== list.length ? Array.from(set) : list;
};

/* istanbul ignore next */
const activeIllness: (state: string | null, action: WorkbenchActions.WorkbenchAction) => string | null =
  (
    /* istanbul ignore next */
    state = workbenchInit.illnesses.active,
    action
  ) => {
    let illKey: string;

    switch (action.type) {
      case WorkbenchActions.SET_ACTIVE_ILLNESS:
        illKey = `${action.idIcd10Code}v${action.version}`;
        return illKey !== state ? illKey : state;
      case WorkbenchActions.DELETE_ILLNESS:
        illKey = `${action.illness}v${action.version}`;
        return illKey === state ? "" : state;
      /* istanbul ignore next */
      default:
        return state;
    }
  };

const readOnlyIllness: (state: Illness.Normalized.IllnessValue | null,
                        action: WorkbenchActions.WorkbenchAction) => Illness.Normalized.IllnessValue | null =
  (state = null, action) => {
    switch (action.type) {
      case WorkbenchActions.SET_READONLY_ILLNESS:
        return action.illness ? normalizeIllness(action.illness) : null;
      case WorkbenchActions.EDIT_READ_ONLY_ILLNESS:
        return null;
      default:
        return state;
    }
  };

const mandatorySymptoms: (state: State.MandatorySymptoms,
                          action: WorkbenchActions.WorkbenchAction) => State.MandatorySymptoms =
  (state = workbenchInit.mandatorySymptoms, action) => {
    switch (action.type) {
      case WorkbenchActions.SET_ACTIVE_ILLNESS:
        return workbenchInit.mandatorySymptoms;
      case WorkbenchActions.SET_MANDATORY_SYMPTOM:
        let smGroup = state[action.groupID];
        if (smGroup && smGroup[action.simptomID])
          return state;
        smGroup = {
          ...smGroup,
          [action.simptomID]: action.basicSymptomID
        };
        return {
          ...state,
          [action.groupID] : smGroup
        };
      case WorkbenchActions.DELETE_MANDATORY_SYMPTOM:
        let sGroup = state[action.groupID];
        if (!sGroup || !sGroup[action.simptomID] )
          return state;
        sGroup = _.omit(sGroup, action.simptomID);
        return Object.keys(sGroup).length
          ? ({
            ...state,
            [action.groupID]: sGroup
           })
          : ({
            ..._.omit(state, action.groupID)
          });
      default:
        return state;
    }
};

const errors: (state: Task.ActiveIllnessError, action: WorkbenchActions.WorkbenchAction) => Task.ActiveIllnessError =
  (state = workbenchInit.errors, action) => {
    switch (action.type) {
      case WorkbenchActions.SET_ACTIVE_ILLNESS:
        return workbenchInit.errors;
      case WorkbenchActions.SET_ILLNESS_ERROR:
        const illErrs = action.error;
        return {...state, illness: illErrs};
      case WorkbenchActions.SET_SYMPTOM_ERROR:
        return updateErrorState(action.error, state);
      case WorkbenchActions.SET_MANY_SYMPTOM_ERRORS:
        let newState: Task.ActiveIllnessError = state;
        action.errors.forEach(err => {
          newState = updateErrorState(err, newState);
        });
        return newState;
      case WorkbenchActions.DELETE_SYMPTOM:
        const symptomGroup = action.path.symptomGroup;
        const sgError = state.symptoms[symptomGroup];
        if (!sgError || !sgError.length) return state;
        const sgErrorList = _.reject(sgError, {"symptomID": action.path.symptomID});
        return sgErrorList.length
          ? {
            ...state,
            symptoms: {
              ...state.symptoms,
              [action.path.symptomGroup]: sgErrorList
            }
          } : {
            ...state,
            symptoms: _.omit(state.symptoms, symptomGroup)
          };
      default:
        return state;
    }
  };

const illnesses: (state: State.WorkbenchIllnesses, action: WorkbenchActions.WorkbenchAction) => State.WorkbenchIllnesses =
  (state = workbenchInit.illnesses, action) => {
    switch (action.type) {
      case WorkbenchActions.SET_ACTIVE_ILLNESS:
        const { taskId, idIcd10Code, name, version, state: illState } = action;
        const illKey = `${idIcd10Code}v${version}`;

        if (!_.has(state.values, illKey)) {
          return {
            ...state,
            active: activeIllness(state.active, action),
            activeTaskId: taskId,
            values: {
              ...state.values,
              [illKey]: emptyIllnessValueFactory(idIcd10Code, name, version, illState)
            }
          };
        } else {
          return {
            ...state,
            activeTaskId: taskId,
            active: activeIllness(state.active, action)
          };
        }
      case WorkbenchActions.RESET_ACTIVE_ILLNESS:
        return {
          ...state,
          activeTaskId: null,
          active: null
        };
      case WorkbenchActions.EDIT_READ_ONLY_ILLNESS:
        const readOnlyValue = action.stateRoot.workbench.readOnlyIllness;
        if (!readOnlyValue) {
          console.error("No read-only illness value to edit.");
          return state;
        }
        const form = readOnlyValue.form;
        return {
          ...state,
          values: {
            ...state.values,
            [`${form.idIcd10Code}v${form.version}`]: readOnlyValue
          }
        };
      case WorkbenchActions.UPSERT_ILLNESS_NORM:
        const illness = action.value;
        return {
          ...state,
          values: {
            ...state.values,
            [`${illness.form.idIcd10Code}v${illness.form.version}`]: illness
          }
        };
      case WorkbenchActions.UPSERT_ILLNESS:
        const v = action.formValue;
        // This action may be dispatched with illness values that don't have all entities
        //  if they have been synced with empty symptom groups
        // Populate all default values for type safety
        const populatedIllness: Illness.Normalized.IllnessValue = _.defaultsDeep(
          emptyIllnessValueFactory(v.idIcd10Code, v.name, v.version, v.state),
          normalizeIllness(action.formValue));

        return {
          ...state,
          values: {
            ...state.values,
            [`${action.formValue.idIcd10Code}v${action.formValue.version}`]: populatedIllness
          }
        };
      case WorkbenchActions.SET_SG_COMPLETE_STATUS:
        if (!state.active) return state;

        const shouldBeComplete = action.value;
        const illnessToCompleteValue = _.cloneDeep(state.values[state.active]);
        const sgs = new Set(illnessToCompleteValue.form.groupsComplete);

        if (shouldBeComplete) {
          sgs.add(action.groupID);
        } else {
          sgs.delete(action.groupID);
        }
        illnessToCompleteValue.form.groupsComplete = Array.from(sgs);
        return {
          ...state,
          values: {
            ...state.values,
            [state.active]: illnessToCompleteValue
          }
        };
      case WorkbenchActions.DELETE_ILLNESS:
        return {
          ...state,
          active: activeIllness(state.active, action),
          values: _.omit(state.values, `${action.illness}v${action.version}`)
        };
      case WorkbenchActions.SAVE_SYMPTOM:
        if (!state.active) return state;

        const activeValue = state.values[state.active];
        const editedIllness: Illness.Normalized.IllnessValue = {
          form: activeValue.form,
          entities: {
            ...activeValue.entities,
            symptoms: {
              ...activeValue.entities.symptoms,
              [action.value.symptomID]: action.value
            }
          }
        };
        return {
          ...state,
          values: {
            ...state.values,
            [`${editedIllness.form.idIcd10Code}v${editedIllness.form.version}`]: editedIllness
          }
        };
      case WorkbenchActions.DELETE_SYMPTOM:
        if (!state.active) return state;

        const illnessToDelete = state.values[state.active];
        const categoriesD = {
          ...illnessToDelete.entities.categories,
          [action.path.categoryID]: {
            ...illnessToDelete.entities.categories[action.path.categoryID],
            symptoms: _.without(
              illnessToDelete.entities.categories[action.path.categoryID].symptoms,
              action.symptomID)
          }
        };
        const prunedIllness: Illness.Normalized.IllnessValue = {
          form: illnessToDelete.form,
          entities: {
            ...illnessToDelete.entities,
            categories: categoriesD,
            symptoms: _.omit(illnessToDelete.entities.symptoms, action.symptomID)
          }
        };
        return {
          ...state,
          values: {
            ...state.values,
            [`${prunedIllness.form.idIcd10Code}v${prunedIllness.form.version}`]: prunedIllness
          }
        };
      case WorkbenchActions.INSERT_SYMPTOM:
        if (!state.active) return state;

        const illnessToInsert = state.values[state.active];
        let groups = illnessToInsert.entities.symptomGroups;
        let categories = illnessToInsert.entities.categories;
        let sections = illnessToInsert.entities.sections;
        let parentGroup = groups[action.path.symptomGroup];

        // SYMPTOM GROUP ENTITY
        // add if it doesn't exist yet
        if (!parentGroup) {
          groups = {
            ...groups,
            [action.path.symptomGroup]: illnessValue.symptomGroupValueFactory(action.path.symptomGroup, !!action.path.sectionID)
          };
          illnessToInsert.form.symptomGroups = addIfNotExists(action.path.symptomGroup, illnessToInsert.form.symptomGroups as any) as any;
          parentGroup = groups[action.path.symptomGroup];
        }

        // add category to symptom group entity if it doesn't have it yet
        if (parentGroup.categories) {
          parentGroup.categories = addIfNotExists(action.path.categoryID, parentGroup.categories);
        }

        // SECTION ENTITY
        // if there's a section, add category if it hasn't been added yet
        if (action.path.sectionID && !categories[action.path.categoryID]) {
          // insert section if it doesn't exist yet
          parentGroup.sections = addIfNotExists(action.path.sectionID, parentGroup.sections);
          const parentSection = illnessToInsert.entities.sections[action.path.sectionID]
            || illnessValue.sectionValueFactory(action.path.sectionID);

          // update section with new category
          parentSection.categories = addIfNotExists(action.path.categoryID, parentSection.categories);
          sections = {
            ...illnessToInsert.entities.sections,
            [parentSection.sectionID]: parentSection
          }
        }

        // CATEGORY ENTITY
        // Upsert the category entity
        const parentCat = categories[action.path.categoryID] || illnessValue.categoryValueFactory(action.path.categoryID);
        parentCat.symptoms = addIfNotExists(action.path.symptomID, parentCat.symptoms);
        if (!categories[action.path.categoryID]) {
          // add category to entities
          categories = {
            ...illnessToInsert.entities.categories,
            [parentCat.categoryID]: parentCat
          }
        }

        // SYMPTOM ENTITY
        // Add new symptom to list
        const symptoms = {
          ...illnessToInsert.entities.symptoms,
          [action.value.symptomID]: action.value
        };

        // ILLNESS VALUE
        const insertedIllness: Illness.Normalized.IllnessValue = {
          form: illnessToInsert.form,
          entities: {
            symptomGroups: groups,
            categories,
            sections,
            symptoms
          }
        };

        return {
          ...state,
          values: {
            ...state.values,
            [`${insertedIllness.form.idIcd10Code}v${insertedIllness.form.version}`]: insertedIllness
          }
        };
      default:
        return state;
    }
  };

const workbenchReducer: Reducer<State.Workbench> = combineReducers<State.Workbench>({
  illnesses,
  readOnlyIllness,
  errors,
  mandatorySymptoms
});

export default workbenchReducer;
