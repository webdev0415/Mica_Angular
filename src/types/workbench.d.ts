declare module Workbench {

    interface DataStoreRefTypeValue {
      code: string;
      name: string;
      m_antithesis: number;
      value?: string;
      defaultValue?: boolean;
    }

    interface DataStoreRefType {
      title: string;
      values?: DataStoreRefTypeValue[];
    }

    interface DataStoreRefTypesDictionary {
      [refTypeName: string]: DataStoreRefType
    }

    interface _SymptomGroup {
      name: string;
      groupID: string;
      updatedDate: number;
      dataStoreRefTypes: DataStoreRefTypesDictionary;
    }

    interface SymptomGroupBasic extends _SymptomGroup {
      categories: Category[];
      sections: undefined;
    }

    interface SymptomGroupDeep extends _SymptomGroup {
      sections: Section[];
      categories: undefined;
    }

    type SymptomGroup = SymptomGroupBasic | SymptomGroupDeep;

    interface Section {
      name: string;
      sectionID: string;
      categories: Category[];
    }

    interface Category {
      name: string;
      categoryID: string;
      symptoms: Symptom.Data[];
    }

    namespace Normalized {
      type Entities = Readonly<{
        categories: {
          [id: string]: Category;
        }
        sections: {
          [id: string]: Section;
        }
        symptomGroups: {
          [id: string]: SymptomGroup;
        }
        symptoms: {
          [id: string]: Symptom.Data;
        }
      }>


      interface SymptomGroupBasic extends _SymptomGroup {
        categories: string[];
        sections: undefined;
      }

      interface SymptomGroupDeep extends _SymptomGroup {
        sections: string[];
        categories: undefined;
      }

      type SymptomGroup = SymptomGroupBasic | SymptomGroupDeep;

      interface Section {
        name: string;
        sectionID: string;
        categories: string[];
      }

      interface Category {
        name: string;
        categoryID: string;
        symptoms: string[];
      }
    }
  }
