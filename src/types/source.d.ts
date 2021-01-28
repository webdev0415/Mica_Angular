
declare module SourceInfo {
  type SourceType = 'MICA' | 'ECW' | 'NLP';
  type TemplateType = 'SYMPTOM' | 'ILLNESS';

  // interface Value {
  //     sources: number[];
  //     sourceType?: string;
  //     sourceRefDate?: number;
  // }

  // interface Symptom {
  //     symptomID: string;
  //     sourceInformation: [Value];
  // }

  // interface Item {
  //     [id: string] : [Symptom];
  // }

  // interface Response {
  //     icd10Code: string;
  //     source: sourceType;
  //     state: Illness.State | undefined;
  //     data: [Symptom]
  // }

  interface Source {
    rank: number,
    source: string,
    sourceID?: number
    sourceTitle: string
    sourceType?: string
  }

  interface SourcesDictionary {
    [sourceID: number]: SourceInfo.Source;
  }

  interface SourceInfoType {
    addedBy: 'NLP' | 'Doctor';
    enable: boolean;
    sourceID: number;
    verified: boolean;
    sourceRefDate?: number;
  }

  type Action = 'Drug/NonDrug' | 'Treatment' | 'Illness' | 'Symptom' | 'Add';

  interface ShortTreatment {
    typeDescID?: number;
    drugName?: string;
    sourceInfo: Array<{
      sourceID: number;
      action: Action;
    }>
  }

  interface SymptomSource {
    multiplier?: string;
    sourceInfo: Array<{
      sourceID: number;
      action: Action;
    }>
  }

  interface RemovePayload {
    icd10Code?: string;
    version?: number;
    state?: Illness.State;
    symptomID?: string;
    treatments?: Array<ShortTreatment>;
    symptomSources?: Array<SymptomSource>;
  }
}
