/// <reference path='./index.d.ts'/>

declare module State {

    type AppName = 'mica' | 'mita' | 'treatments' | 'symptomLink';

    interface ReduxWindow extends Window {
      devToolsExtension: any;
    }

    interface ActiveDescriptors {
      [illness: string]: {
        [symptomCode: string]: number[];
      }
    }

    interface ActivateEditToken {
      id: string;
      name?: string;
      index?: number;
    }

    interface Nav {
      activeGroup: string;
      activeSection: string;
      activeCategory: string;
      activeEdit: ActivateEditToken | null; // used in review
      symptomItems: MICA.SymptomNavItem[];
      tabs: MICA.NavBarType[];
      title: string;
      // bodySelection: BodySelection;
      activeDescriptors: ActiveDescriptors;
      navBar: MICA.NavBarType;
      showIllnessErrors: boolean;
    }

    interface TypeaheadState {
      [name: string]: MICA.SelectableEl[]
    }

    type ExternalMultiplier = StaticExternalMultiplier | LiveSearchExternalMultiplier;

    interface StaticExternalMultiplier {
      dataStoreRefTypeName: string;
      url: string;
      type: 'static';
    }

    interface LiveSearchExternalMultiplier {
      dataStoreRefTypeName: string;
      searchName: MICA.LiveSearchType;
      type: 'liveSearch';
    }

    interface MultiplierState {
      typeahead: TypeaheadState;
      withExternalAPI: ExternalMultiplier[];
    }

    interface GroupsState {
      groups: Groups.Group[]
    }

    interface LabordersState {
      laborders: Laborders.Laborder[]
    }

    type ApiConfig = Readonly<{
      MICA: {
        root: string;
        updateIllState: string;
        saveIllness: string;
        fetchSavedIllnesses: string;
        uniqueness: string;
        illnesses: string;
        approvedIllnesses: string;
        searchIllnesses: string;
      };
      MITA: {
        root: string;
        userByEmail: string;
        tasks: string;
        skip: string;
      },
      search: {
        drugByName: string;
        snomedCode: string;
        illnessNode: string;
        remoteIllnessValue: string;
      },
      treatments: {
        types: string;
        illness: {
          post: string;
          get: string;
        };
        symptom: {
          post: string;
          get: string;
        };
        drugInfo: string;
      },
      symptoms: {
        symptomGroups: string;
        nlpSymptomGroups: string;
        template: string;
        templateError: string;
        definitions: string;
      },
      ecw: {
        illness: string;
      },
      nlp: {
        illness: string;
        symptoms: string;
      },
      symptomSources: {
        search: string;
        add: string;
        getByIllness: string;
        remove: string;
      },
      treatmentSources: {
        search: string;
        add: string;
        getByCode: string;
        remove: string;
      },
      symptomGroups: {
        all: string,
        saveOrUpdate: string,
        delete: string
        getSymptomsInGroup: string;
      },
      laborder: {
        all: string
      }
    }>


    interface Global {
      version: string;
      bootstrapped: boolean;
      currentApp: AppName | null;
      idleTime: number;
      api: ApiConfig;
      apiTimeout: number;
      user?: string;
      illness?: string;
      countries: MICA.Country[];
      allowEditQuestionIn: string[];
      illStates: {
        pending: Illness.State
        complete: Illness.State
        readyForReview: Illness.State
        approved: Illness.State
        rejected: Illness.State
        protected: Illness.State
      };
    }

    interface Messages {
      queue: MICA.NotificationMessage[];
      actions: MICA.NotificationAction[];
    }

    interface TaskState {
      tasks: Task.Data[];
      checkedPreviousVersion: boolean;
    }

    interface IllnessesState {
      illnesses: Illness.DataShort[]
    }

    interface Symptoms {
      multiplier: MultiplierState;
      bodySelectorMultipliers: string[];
      entities: Workbench.Normalized.Entities;
      nlpSymptoms: NlpSymptoms
    }

    interface NlpSymptoms {
      cachedSymptoms: { [key: string]: any },
      currentSearch: Array<any>,
      total: number,
      page: number
    }

    type WorkbenchIllnesses = Readonly<{
      values: { [idIcd10Code: string]: Illness.Normalized.IllnessValue }
      active: string | null;
      activeTaskId: number | null;
    }>;

    interface Workbench {
      illnesses: WorkbenchIllnesses;
      readOnlyIllness: Illness.Normalized.IllnessValue | null; // user to load and inspect illness without making it active
      errors: Task.ActiveIllnessError;
      mandatorySymptoms: State.MandatorySymptoms
    }

    interface TreatmentsState {
      nonDrugTreatmentForm: string;
      showValidation: boolean;
      currentRecord: CurrentTreatmentRecord;
      nonDrugTemplates: Treatments.Types.Template[];
      drugTemplates: Treatments.Types.Template[];
      addDrugStepper: AddDrugState;
      byDrug: ByDrugState;
    }

    interface CurrentTreatmentRecord {
      isNew: boolean;
      record: Treatments.Record.New | null;
    }

    interface ByDrugState {
      drugsSearchResults: Treatments.Drug.Short[];
      activeDrugInfo: Treatments.Drug.GenericSearchModel | null;
      illnessesSearchResults: Illness.SearchValue[];
    }

    interface AddDrugState {
      drugsSearchResults: Treatments.Drug.Short[];
      drugsSearching: boolean;
      selectedDrugInfo: Treatments.Drug.GenericSearchModel | null;
      illnessSearchResults: Illness.SearchValue[];
      illnessSearchResultsTwo: Illness.SearchValue[];
    }

    interface SymptomTemplates {
      data: Symptom.Template | null;
      editableProperties: Symptom.EditableMetadata[];
      saving: boolean;
    }

    interface BodySelection {
      zone: string;
      bodyParts: string[];
      selected: string[];
    }

    type reviewsParams =  Readonly<{
      filter: ECW.AnyState;
      page: number;
      pageSize: number;
    }>

    type EcwIllnessValue = Readonly<{
      [idIcd10Code: string]: Illness.Normalized.IllnessValue
    }>

    type EcwIllnesses = Readonly<{
      active: string,
      values: EcwIllnessValue
    }>

    interface ECW {
      params: reviewsParams;
      active: ECW.Illness;
      illnesses: EcwIllnesses;
      validation: ECW.Validation;
    }

    interface Sources {
      // MICA: SourceInfo.Item;
      // ECW: SourceInfo.Item;
      // NLP: SourceInfo.Item;
      symptomSources: SourceInfo.SourcesDictionary;
      treatmentSources: SourceInfo.SourcesDictionary;
    }

    type Root = Readonly<{
      nav: Nav;
      global: Global;
      messages: Messages;
      task: TaskState;
      user: UserState;
      symptoms: Symptoms;
      sources: Sources;
      workbench: Workbench;
      treatments: TreatmentsState;
      symptomTemplates: SymptomTemplates;
      ecw: ECW;
      illnesses: IllnessesState;
      groups: GroupsState;
      laborders: LabordersState;
    }>

    type UserState = Readonly<MICA.User.Data>;

    interface MandatorySymptoms {
      [symptomGroupID: string]: {
        [idIcd10Code: string]: string
      }
    }
  }
