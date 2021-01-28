import { InjectionToken } from '@angular/core';
import { environment } from '../environments/environment';
import * as _ from 'lodash';

const pkg = require('../../package.json');

function apiConfig(): State.ApiConfig {
  /* istanbul ignore next */
  const hostname = environment.serviceUrls.host;
  const MITAPath = `${hostname}/RESTfulIllness`;
  const MICAPath = `${hostname}/2070Services`;
  const treatmentPath = `${MICAPath}/treatment`;
  const restUsfda = `${hostname}/rest-usfda`;
  const ICD10NodeSearch = `${hostname}/mita-rest/illness/icd10code/`;
  const mitaRest = `${hostname}/mita-rest`;
  const snomedRest = `${hostname}/snomed-rest`;
  /* istanbul ignore next */
  const utilities = environment.serviceUrls.utility;
  const illnessPath = 'mica/api/illness';
  const mockmica = 'https://testing2.advinow.net/api/v2/2070/illnesses/';

  return {
    MITA: {
      root: MITAPath,
      userByEmail: _.join([mitaRest, 'user/email'], '/'),
      tasks: 'task',
      skip: _.join([MITAPath, 'skip'], '/')
    },
    MICA: {
      root: MICAPath,
      saveIllness: _.join([MICAPath, illnessPath], '/'),
      updateIllState: 'update/user',
      fetchSavedIllnesses: _.join([MICAPath, 'mica/api/illness/user'], '/'),
      uniqueness: _.join([MICAPath, 'mica', 'illness', 'uniqueness'], '/'),
      illnesses: _.join([MICAPath, illnessPath, '?page=1&size=10000'], '/'),
      approvedIllnesses: _.join([MICAPath, 'mica/approved/illnesses'], '/'),
      searchIllnesses: _.join([mitaRest, 'illness', 'icd10code'], '/'),
    },
    search: {
      drugByName: _.join([restUsfda, 'v1', 'searchByDrugName'], '/'),
      snomedCode: _.join([snomedRest, 'snomed/codes?sctid='], '/'),
      illnessNode: ICD10NodeSearch,
      remoteIllnessValue: mockmica
    },
    treatments: {
      types: _.join([treatmentPath, 'types'], '/'),
      illness: {
        get: _.join([treatmentPath, 'v1', 'illness', 'short'], '/'),
        post: _.join([treatmentPath, 'v1', 'illness'], '/')
      },
      symptom: {
        get: _.join([treatmentPath, 'v1', 'symptom', 'short'], '/'),
        post: _.join([treatmentPath, 'v1', 'symptom'], '/')
      },
      drugInfo: _.join([restUsfda, 'combinationdrugs'], '/'),
    },
    symptoms: {
      symptomGroups: _.join([MICAPath, 'es/template/symptomgroups'], '/'),
      nlpSymptomGroups: _.join([MICAPath, 'en/template/symptomsByCategory'], '/'),
      template: _.join([MICAPath, 'es/template/v1/symptoms'], '/'),
      templateError: _.join([MICAPath, 'es/template/symptoms', 'validate'], '/'),
      definitions: _.join([MICAPath, 'template/symptoms', 'definitions'], '/')
    },
    ecw: {
      illness: _.join([MICAPath, 'ecw/api/illness'], '/')
    },
    nlp: {
      illness: _.join([MICAPath, 'nlp/api/illness'], '/'),
      symptoms: _.join([MICAPath, 'sources', 'symptoms'], '/'),
    },
    symptomSources: {
      search: _.join([MICAPath, 'symptomsources', 'search'], '/'),
      add: _.join([MICAPath, 'symptomsources', 'add'], '/'),
      getByIllness: _.join([MICAPath, 'mica', 'illness', 'sources'], '/'),
      remove: _.join([MICAPath, 'mica', 'illness', 'sources'], '/'),
    },
    treatmentSources: {
      search: _.join([MICAPath, 'treatmentsources', 'search'], '/'),
      add: _.join([MICAPath, 'treatmentsources', 'add'], '/'),
      getByCode: _.join([treatmentPath, 'sources'], '/'),
      remove: _.join([treatmentPath, 'illness', 'sources'], '/'),
    },
    symptomGroups: {
      all: _.join([MICAPath, 'groups', 'all'], '/'),
      saveOrUpdate: _.join([MICAPath, 'groups', 'saveOrUpdate'], '/'),
      delete: _.join([MICAPath, 'groups', ''], '/'),
      getSymptomsInGroup: _.join([MICAPath, 'template/groups', ''], '/'),
    },
    laborder: {
      all: _.join([MICAPath, 'laborders', ''], '/')
    }
  };
}

export const pageSizes: number[] = [20, 40, 100];

export const snomedPage: number[] = [25, 50, 100];

export const navInit: State.Nav = {
  symptomItems: [{
    name: 'General',
    path: 'general'
  },             {
    name: 'Behaviour',
    path: 'behaviour'
  },             {
    name: 'Neurological',
    path: 'neurological'
  },             {
    name: 'Physical',
    path: 'physical'
  },             {
    name: 'Pain/Swelling',
    path: 'pain'
  },             {
    name: 'Measurements',
    path: 'measurements'
  },             {
    name: 'Labs',
    path: 'labs'
  },             {
    name: 'Causes',
    path: 'causes'
  },
                 {
      name: 'NLP',
      path: 'nlp'
    },
                 {
      name: 'Triage',
      path: 'triage'
    }
  ],
  tabs: ['symptoms', 'treatments', 'templates', 'inspector', 'groups'],
  activeGroup: '',
  activeSection: '',
  activeEdit: null,
  activeCategory: '',
  title: 'MICA',
  activeDescriptors: {},
  navBar: 'symptoms',
  showIllnessErrors: false
};

/* istanbul ignore next */
export const globalStateInit: State.Global = {
  version: pkg.version,
  bootstrapped: false,
  currentApp: null,
  idleTime: environment.production ? 30 * 60 * 1000 : 60 * 60 * 1000,
  api: apiConfig(),
  apiTimeout: environment.production ? 20000 : 30000,
  allowEditQuestionIn: _.without(_.map(navInit.symptomItems, 'path'), 'measurements') as string[],
  illStates: {
    pending: 'PENDING',
    complete: 'COMPLETE',
    readyForReview: 'READY-FOR-REVIEW',
    approved: 'APPROVED',
    rejected: 'REJECTED',
    protected: 'PROTECTED'
  },
  countries: []
};

export const messagesStateInit: State.Messages = {
  queue: <MICA.NotificationMessage[]>[],
  actions: <MICA.NotificationAction[]>[]
};

export const userInit: State.UserState = {
  userID: -1,
  roleID: -1,
  roleName: null,
  name: '',
  surname: '',
  email: ''
};

export const symptomsInit: State.Symptoms = {
  multiplier: {
    withExternalAPI: [{
      dataStoreRefTypeName: 'Cancer',
      url: globalStateInit.api.MITA.root + '/cancerlist',
      type: 'static',
    },                {
      dataStoreRefTypeName: 'Medication',
      searchName: 'drugByName',
      type: 'liveSearch'
    },                {
      dataStoreRefTypeName: 'Previous Illness',
      searchName: 'illnessNode',
      type: 'liveSearch'
    },                {
      dataStoreRefTypeName: 'Concurrent Illness',
      searchName: 'illnessNode',
      type: 'liveSearch'
    },                {
      dataStoreRefTypeName: 'Adverse Drug Reaction',
      searchName: 'drugByName',
      type: 'liveSearch'
    }],
    typeahead: {}
  },
  bodySelectorMultipliers: ['PainStartedSomewhereElse'],
  entities: {
    categories: {},
    sections: {},
    symptomGroups: {},
    symptoms: {}
  },
  nlpSymptoms: {
    cachedSymptoms: {},
    currentSearch: [],
    total: 0,
    page: 1
  }
};

export const taskInit: State.TaskState = {
  tasks: [],
  checkedPreviousVersion: false,
};

export const illnessesInit: State.IllnessesState = {
  illnesses: []
};

export const workbenchInit: State.Workbench = {
  illnesses: {
    values: {},
    active: '',
    activeTaskId: 0
  },
  readOnlyIllness: null,
  errors: {
    illness: {},
    symptoms: {}
  },
  mandatorySymptoms: {}
};

export const treatmentsInit: State.TreatmentsState = {
  nonDrugTreatmentForm: '',
  showValidation: false,
  currentRecord: {
    isNew: false,
    record: null
  },
  drugTemplates: [],
  nonDrugTemplates: [],
  addDrugStepper: {
    drugsSearchResults: [],
    drugsSearching: false,
    selectedDrugInfo: null,
    illnessSearchResults: [],
    illnessSearchResultsTwo: [],
  },
  byDrug: {
    drugsSearchResults: [],
    activeDrugInfo: null,
    illnessesSearchResults: [],
  }
};

export const symptomTemplatesInit: State.SymptomTemplates = {
  data: null,
  saving: false,
  editableProperties: [{
    name: 'definition',
    key: 'definition',
    defaultValue: ''
  },                   {
    name: 'treatable',
    key: 'treatable',
    defaultValue: false
  },                   {
    name: 'Multiple Answers',
    key: 'cardinality',
    defaultValue: false
  },                   {
    name: 'criticality',
    key: 'criticality',
    defaultValue: 0,
    minMax: [0, 9]
  },                   {
    name: 'question',
    key: 'question',
    defaultValue: ''
  },                   {
    name: 'question in spanish',
    key: 'es_question',
    defaultValue: ''
  },                   {
    name: 'displayDrApp',
    key: 'displayDrApp',
    defaultValue: true
  },                   {
    name: 'genderGroup',
    key: 'genderGroup',
    defaultValue: 'null'
  },                   {
    name: 'symptomGroup',
    key: 'symptomGroup',
    defaultValue: ''
  },                   {
    name: 'labsOrdered',
    key: 'labsOrdered',
    defaultValue: ''
  },                   {
    name: 'antithesis',
    key: 'antithesis',
    defaultValue: {
      root: 0.01
    },
    minMax: [0, 1]
  },
  ]
};

export const ecwInit: State.ECW = {
  params: {
    filter: 'ALL',
    page: 1,
    pageSize: 20
  },
  active: {
    icd10Code: '',
    name: '',
    status: 'LOADED',
    version: 1
  },
  illnesses: {
    active: '',
    values: {}
  },
  validation: {
    illness: null,
    symptoms: null,
    missingData: null
  }
};

export const sourceInit: State.Sources = {
  // MICA: {},
  // ECW: {},
  // NLP: {},
  symptomSources: {},
  treatmentSources: {}
};

export const groupsInit: State.GroupsState = {
  groups: []
};

export const laborersInit: State.LabordersState = {
  laborders: []
};

export const defaultState: State.Root = {
  global: globalStateInit,
  messages: messagesStateInit,
  nav: navInit,
  user: userInit,
  task: taskInit,
  symptoms: symptomsInit,
  sources: sourceInit,
  treatments: treatmentsInit,
  symptomTemplates: symptomTemplatesInit,
  workbench: workbenchInit,
  ecw: ecwInit,
  illnesses: illnessesInit,
  groups: groupsInit,
  laborders: laborersInit
};

export const stateKeysToSync = ['nav', 'task.userData'];

export const authConfig: MICA.Auth0Configuration = {
  clientID: 'KmvAeHT9I6R4zV8psKOJfCJO9Wq8lavo',
  domain: 'advi.auth0.com'
};

export let AUTH_CONFIG = new InjectionToken('auth.config');
