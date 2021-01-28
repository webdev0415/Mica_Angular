import * as _ from 'lodash';
import { treatmentsInit } from 'app/app.config';
import { Action, createReducer, on } from '@ngrx/store';
import * as TreatmentsActions from './treatments.actions';
import * as SourcesActions from '../../../state/source/source.actions';
import { isDrugTreatment } from '../../../util/isDrugTreatmet';
import * as ByDrugActions from '../components/by-drug/state/by-drug.actions';

const treatmentsReducer = createReducer(
  treatmentsInit,
  on(TreatmentsActions.setActiveTreatmentsRecord, (state, { record, isNew }) => {
    return {
      ...state,
      showValidation: false,
      currentRecord: {
        isNew,
        record
      }
    }
  }),
  on(TreatmentsActions.setActiveTreatmentsRecordGroups, (state, { template, groups }) => {
    const newState = _.cloneDeep(state);
    const { record } = newState.currentRecord;

    if (!record) return state;

    const defaultTreatment = {
      name: template.name,
      typeID: template.typeID
    };
    let treatment;

    if (!record.treatments) {
      treatment = <any>defaultTreatment;
      (<any>record).treatments = [ defaultTreatment ];

    } else {
      treatment = record.treatments.find(el => {
        return el.name === template.name;
      });

      if (!treatment) {
        treatment = <any>defaultTreatment;
        record.treatments.push(treatment);
      }
    }

    ((<any>treatment).groups = groups);

    return newState;
  }),
  on(TreatmentsActions.toggleValidation, (state, { value }) => {
    return { ...state, showValidation: _.isUndefined(value) ? !state.showValidation : value };
  }),
  on(TreatmentsActions.loadTreatmentTypesSuccess, (state, { treatmentTypes }) => {
    const drugTemplates: Treatments.Types.Template[] = [];
    const nonDrugTemplates: Treatments.Types.Template[] = [];

    treatmentTypes.map(type => {

      if (isDrugTreatment(type.typeID)) {
        drugTemplates.push(type);

      } else {
        const descriptions = type.treatmentTypeDesc;

        if (!descriptions || !descriptions.length) {
          console.warn('Skipping treatment type because it has invalid format: ', type);
          return;
        }

        const defaultValue = _.find(descriptions, { defaultValue: true });

        if (!defaultValue) {
          console.warn(`No default value for ${type.name}, applying first value`, type);
          descriptions[0].defaultValue = true;
        }

        nonDrugTemplates.push(type);
      }
    });

    return {
      ...state,
      drugTemplates,
      nonDrugTemplates
    }
  }),
  on(TreatmentsActions.searchDrugsByName, state => {
    return {
      ...state,
      addDrugStepper: {
        ...state.addDrugStepper,
        searchingDrugs: true,
      }
    }
  }),
  on(TreatmentsActions.searchDrugsByNameSuccess, (state, { drugs }) => {
    return {
      ...state,
      addDrugStepper: {
        ...state.addDrugStepper,
        drugsSearchResults: drugs,
        searchingDrugs: false,
      }
    }
  }),
  on(TreatmentsActions.resetStepper, state => {
    return {
      ...state,
      addDrugStepper: { ...treatmentsInit.addDrugStepper }
    }
  }),
  on(TreatmentsActions.loadDrugInfo, (state) => {
    return {
      ...state,
      addDrugStepper: {
        ...state.addDrugStepper,
        selectedDrugInfo: null
      }
    }
  }),
  on(TreatmentsActions.loadDrugInfoSuccess, (state, { drug }) => {
    return {
      ...state,
      addDrugStepper: {
        ...state.addDrugStepper,
        selectedDrugInfo: drug
      }
    }
  }),
  on(TreatmentsActions.searchStepperIllnessesSuccess, (state, { illnesses }) => {
    return {
      ...state,
      addDrugStepper: {
        ...state.addDrugStepper,
        illnessSearchResults: illnesses
      }
    }
  }),
  on(TreatmentsActions.searchStepperIllnessesTwoSuccess, (state, { illnesses }) => {
    return {
      ...state,
      addDrugStepper: {
        ...state.addDrugStepper,
        illnessSearchResultsTwo: illnesses
      }
    }
  }),
  on(TreatmentsActions.updateRecord, (state, { record }) => {
    return {
      ...state,
      currentRecord: {
        ...state.currentRecord,
        record,
      }
    }
  }),
  on(ByDrugActions.searchDrugsSuccess, (state, { drugs }) => {
    return {
      ...state,
      byDrug: {
        ...state.byDrug,
        drugsSearchResults: drugs,
      }
    }
  }),
  on(ByDrugActions.resetDrugSearchResults, state => {
    return {
      ...state,
      byDrug: {
        ...state.byDrug,
        drugsSearchResults: [],
      }
    }
  }),
  on(ByDrugActions.loadDrugInfoSuccess, (state, { drug }) => {
    return {
      ...state,
      byDrug: {
        ...state.byDrug,
        activeDrugInfo: drug,
      }
    }
  }),
  on(ByDrugActions.resetStore, state => {
    return {
      ...state,
      byDrug: {
        ...state.byDrug,
        drugsSearchResults: [],
        activeDrugInfo: null
      }
    }
  }),
  on(ByDrugActions.searchIllnessesSuccess, (state, { results }) => {
    return {
      ...state,
      byDrug: {
        ...state.byDrug,
        illnessesSearchResults: results
      }
    }
  }),
  on(SourcesActions.removeSource, (state, { sourceID, action }) => {
    const { record } = state.currentRecord;
    const treatments = record && _.cloneDeep(record.treatments);

    if (action === 'Treatment') {
      treatments && treatments.forEach((t: Treatments.Drug.Extended | Treatments.NonDrug.Extended) => t.groups.forEach((g: any) => {
        const descs = g.drugs || g.nonDrugs;

        descs && descs.forEach((desc: any) => {
          desc.sourceInfo = desc.sourceInfo.reduce(
            (res: any, source: any) => {
              if (source.sourceID !== sourceID) res.push(source);

              return res;
            },
            <SourceInfo.SourceInfoType[]>[]
          );
        });
      }));

      return {
        ...state,
        currentRecord: {
          ...state.currentRecord,
          record: {
            ...<Treatments.Record.New>state.currentRecord.record,
            treatments: <any>treatments
          }
        }
      };
    }
  }),
);

export function reducer(state: State.TreatmentsState | undefined, action: Action) {
  return treatmentsReducer(state, action);
}

export const storeKey = 'treatments';
