declare module Symptom {

  type _Location = Readonly<{
    symptomGroup: string;
    sectionID: string;
    categoryID: string;
    symptomID: string;
  }>

  interface LocationData extends _Location {
    categoryName: string;
    viewName?: string | null;
  }

  interface LocationValue extends _Location {
    idIcd10Code: string;
  }

  type Model = Readonly<{
    bias: boolean;
    descriptors: string;
    descriptorFile?: string;
    dataStoreTypes: string[];
    rangeValues?: [number, number];
    minDiagCriteria: boolean;
    medNecessary: boolean;
    must: boolean;
    ruleOut: boolean;
  }>

  type TemplateError = Readonly<{
    name: string;
    symptomID: string;
    dataInvalidAttributes: string[];
    multiplier: {
      [key: string]: string[];
    }
  }>

  type GenderType = "U" | "F" | "M";

  interface SnomedCode {
    snomedCodes: number[];
    snomedName: string;
  }

  interface Option {
    optionCode: string;
    optionDescription: string;
    es_optionDescription: string;
    antithesis: number;
    displaySymptom: boolean;
    lowerLimit: number | '';
    lowerLimitConnection: string;
    upperLimit: number | '';
    upperLimitCondition: string;
    isNormal: boolean | '';
    icd10RCodes: string[];
    snomedCodes: SnomedCode[];
  }

  type Template = Readonly<{
    symptomID: string;
    name: string;
    es_name: string;
    criticality: number;
    question: string;
    es_question: string;
    treatable: boolean;
    cardinality: boolean;
    definition: string;
    displayDrApp: boolean;
    genderGroup: GenderType;
    groupID: string | Array<number> | null;
    labsOrdered?: string | Array<string> | null;
    additionalInfo: Option[]
    labSymptom?: boolean;
  }>

  type EditableMetadata = Readonly<{
    name: string;
    key: string;
    defaultValue: string | number | boolean | {[key: string]: number | string};
    minMax?: [number, number];
  }>

  interface Data {
    antithesis: number;
    bodyParts?: string[];
    criticality: number;
    multipleValues?: string;
    name: string;
    prior: number;
    question: string;
    es_question: string;
    symptomID: string;
    symptomsModel: Model;
    treatable: boolean;
    painSwellingID?: number;
    subGroups?: [string, string, string];
    // not synced with API
    validators?: {[name: string]: any};
    displayListValues: {[name: string]: any};
    definition?: string;
    genderGroup: GenderType;
    groupID?: string | Array<number> | null;
    labsOrdered?: string | Array<string> | null;
    isRange?: boolean;
    minRange?: number;
    maxRange?: number;
    symptomType?: string;
    lowerLimit?: number;
    lowerLimitCondition?: string;
    upperLimit?: number;
    upperLimitCondition?: string;
    isNormal?: boolean;
  }

  interface Value {
    symptomID: string;
    bodyParts?: string[];
    rows: RowValue[];
    isMissing?: boolean;
  }

  type ValueError = Readonly<{
    symptomID: string;
    name: string;
    groupID: string;
    bodyParts: MICA.ControlError | null;
    rowErrors: RowError[] | null;
  }>

  interface RowValue {
    bias: boolean;
    likelihood?: string;
    multiplier?: string[] | number[];
    modifierValues?: ModifierValue[];
    sourceInfo: SourceInfo.SourceInfoType[];
    medNecessary: boolean;
    minDiagCriteria: boolean;
    must: boolean;
    ruleOut: boolean;
  }

  type RowError = Readonly<{
    index: number;
    bias?: MICA.ControlError;
    likelihood?: MICA.ControlError;
    multiplier?: MICA.ControlError;
    modifierValues?: ModifierError[];
    medNecessary?: MICA.ControlError;
    minDiagCriteria?: MICA.ControlError;
    must?: MICA.ControlError;
    ruleOut?: MICA.ControlError;
  }>

  type RootError = Readonly<{
    bodyParts?: MICA.ControlError;
  }>

  type ModifierType = "Age" | "Time" | "Ethnicity" | "Recurs";

  interface ModifierValue {
    name: ModifierType;
    modifierValue?: string;
    scale?: ScaleValue;
    likelihood: string;
  }

  type ModifierError = Readonly<{
    index: number;
    name: string;
    modifierValue?: MICA.ControlError;
    scale?: ScaleError;
    likelihood?: MICA.ControlError;
  }>

  interface ScaleValue {
    upperTimeLimit?: number;
    value?: string | number;
    scaleTimeLimitStart?: number;
    slope?: string;
    timeUnit?: string;
    timeFrame: string;
  }

  type ScaleError = Readonly<{
    upperTimeLimit?: MICA.ControlError;
    value?: MICA.ControlError;
    scaleTimeLimitStart?: MICA.ControlError;
    slope?: MICA.ControlError;
    timeUnit?: MICA.ControlError;
  }>

  interface Subgroup2 {
    title: string;
    basicSymptomID?: string;
    symptoms: Symptom.Data[];
  }

  interface Subgroup1 {
    title: string;
    basicSymptomID?: string;
    subgroup2: Subgroup2[];
  }

  interface Group {
    [view: string]: Subgroup1[]
  }

  interface Definition {
    code: string;
    definition: string;
  }
}
