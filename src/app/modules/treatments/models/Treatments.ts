declare module Treatments {

  namespace Types {
    interface Response {
      treatmentTypes: Template[];
    }

    interface Template {
      name: string;
      typeID: number;
      treatmentTypeDesc: TreatmentTypeDescTemplate[];
    }

    interface TreatmentTypeDescTemplate {
      shortName: string;
      longName: string;
      typeDescID: number;
      defaultValue?: boolean;
      priority?: number;
      description?: string;
      conceptID?: number;
      cptCode?: number;
    }

    type TemplatesByKind = [Template[], Template[]];
  }

  namespace NonDrug {

    interface Extended {
      name?: string;
      typeID: number;
      groups: Group[];
    }

    interface Group {
      groupName: string;
      groupCode: string;
      nonDrugs: Description[];
      drugs?: undefined;
    }

    interface TreatmentDescGroupCreate {
      name: string;
      treatmentTypeDesc: TreatmentDescCreate[];
    }

    interface TreatmentDescCreate {
      shortName: string;
      longName: string;
      defaultValue?: boolean;
    }

    interface Description extends Types.TreatmentTypeDescTemplate {
      sourceInfo: SourceInfo.SourceInfoType[];
    }
  }

  namespace Drug {

    type SearchSource = 'FDA' | 'RXNORM' | 'ALL';
    type DrugType = 'PRESCRIPTION' | 'OTC' | 'ALL';
    type Cardinality = 'SINGLE' | 'MULTI';

    interface ProductInfoModel {
      name: string;
      ndc: string;
      packagingDescription:	string;
    }

    interface Category {
      brandingType: string;
      cardinality:	string;
      deaSchedule:	string;
      description:	string;
      dosageForm:	string[];
      drugType:	string;
      productInfo:	ProductInfoModel[];
      route:	string;
      rxcui:	number;
      rxcui_ai_type:	string;
      rxcui_ai_value:	string;
      rxcui_am_type:	string;
      rxcui_am_value:	string;
      status:	string;
      strength:	number;
    }

    interface GenericModel {
      groupInformation: Category[];
      groupType: string;
    }

    interface SearchHeader {
      brandNames: string[];
      drugName:	string;
      atcgroups: AtcGroup[];
      ingredients: Category[];
    }

    interface GenericSearchModel {
      genericRxcui: GenericModel[];
      header: SearchHeader;
    }

    interface Short {
      name: string;
      productIds: string[];
    }

    interface Extended {
      name?: string;
      typeID: number;
      groups: Group[];
    }

    interface Group {
      groupName: string;
      groupCode: string;
      nonDrugs?: undefined;
      drugs: Description[];
    }

    interface Description {
      likelihood?: number;
      drugName: string;
      rxcui?: number;
      rxcuiDesc?: string;
      sourceInfo: SourceInfo.SourceInfoType[];
      dosageRecommendation?: Dosage;
      policies?: Policy[] | []
    }

    interface Policy {
      id?: number;
      action: string;
      target: string;
      propertyName: string[];
      targetDetail: string[];
      targetOperator: string;
      targetCompare: string;
      alternative?: DrugAlternative;
    }

    interface DrugAlternative {
      rxcui?: number;
      rxcuiDesc?: string;
      drugName: string;
      dosageRecommendation: Dosage;
    }

    interface Dosage {
      form: string;
      route: string;
      frequency: string;
      dispenseForm: string;
      directions: string;
      quantity: number;
      prn: boolean;
      daw: boolean;
      strength: number;
      amount?: string;
      unit?: string;
    }
  }

  namespace Record {
    interface _ {
      treatments: Array<NonDrug.Extended | Drug.Extended>;
    }

    interface Illness extends _ {
      icd10Code: string;
      symptomID: undefined;
    }

    interface Symptom extends _ {
      icd10Code: undefined;
      symptomID: string;
      name: string;
    }

    type New = Illness | Symptom;
  }

  interface AtcGroup {
    atcGroupName?: string;
    groupCode: string;
    micaGroupName?: string;
  }

  interface Search {
    new: boolean | null;
    record: Record.New | null
  }
}
