  declare module Illness {

    type State = 'PENDING' | 'COMPLETE' | 'READY-FOR-REVIEW' | 'REJECTED' | 'APPROVED' | 'PROTECTED';

    type Node =  Readonly<{
      nodeName: string;
      icd10Code: string;
      name: string;
      description: string;
    }>

    interface DataShort {
      icd10Code: string;
      version: number;
      name: string;
      status: State;
    }

    interface SearchValue {
      name: string;
      description: string;
      childNodes?: SearchValue[];
    }

    /**
     *
     * As received from the backend service
     */
    interface Data {
      idIcd10Code: string;
      version: number;
      name: string;
      chapterDescription: string;
      criticality?: number;
      blockParentDescription?: string;
      chapterId?: number;
      sectionDescription?: string;
      sectionName?: string;
      sectionId?: number;
    }

    interface FormValueCategory {
      categoryID: string;
      symptoms: Symptom.Value[];
    }

    interface FormValueSection {
      sectionID: string;
      categories: FormValueCategory[];
    }

    interface FormValueSymptomGroup {
      groupID: string;
      sections?: FormValueSection[];
      categories?: FormValueCategory[];
    }

    interface FormValue {
      name: string;
      criticality?: number;
      state: State;
      version: number;
      idIcd10Code: string;
      groupsComplete: string[];
      rejectionReason?: string;
      symptomGroups: FormValueSymptomGroup[];
    }

    type UniquenessCheckLink = Readonly<{
      self: string;
      uniquenessCheck?: string;
    }>;

    type UndifferentiableIllness = Readonly<{
      id: string;
      _links: UniquenessCheckLink
    }>

    type UniquenessRes = Readonly<{
      id: string;
      _embedded: {
        uniquenessCheck: {
          id: string;
          undifferentiableIllnesses: UndifferentiableIllness[];
          _links: UniquenessCheckLink
        }
      };
      _links: UndifferentiableIllness;
    }>;

    namespace Normalized {

      type Entities = Readonly<{
        categories: { [id: string]: FormValueCategory };
        sections: { [id: string]: FormValueSection };
        symptomGroups: { [id: string]: SymptomGroup };
        symptoms: { [id: string]: Symptom.Value };
      }>

      interface _SymptomGroup {
        groupID: string;
      }

      interface SymptomGroupBasic extends _SymptomGroup {
        categories: string[];
        sections?: undefined;
      }

      interface SymptomGroupDeep extends _SymptomGroup {
        sections: string[];
        categories?: undefined;
      }

      type SymptomGroup = SymptomGroupBasic | SymptomGroupDeep;

      interface FormValueSection {
        sectionID: string;
        categories: string[];
      }

      interface FormValueCategory {
        categoryID: string;
        symptoms: string[];
      }

      interface FormValue extends Illness.FormValue {
        symptomGroups: FormValueSymptomGroup[];
      }

      type IllnessValue = Readonly<{
        entities: Entities;
        form: FormValue;
      }>;
    }

    type MisplacedEntities = Array<[string, string, string[]]>;

    type ModelValidation = Readonly<{
      misplaced: {
        symptoms: MisplacedEntities;
      },
      nonExisting: {
        categories: string[];
        sections: string[];
        symptoms: string[];
      },
      invalidValues: {
        bodyParts: string[];
      }
    }>
  }
