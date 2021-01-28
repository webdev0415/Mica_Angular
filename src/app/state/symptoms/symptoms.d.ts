import { Action } from "redux";

declare namespace Symptoms {
  namespace Actions {
    interface SetSymptomGroup extends Action {
      data: Workbench.SymptomGroup;
    }

    interface Upgrade extends Action {}


    interface SetMultiplierSearch extends Action {
      key: string;
      values: MICA.SelectableEl[]
    }

    interface SetSymptomDefinition extends Action {
      values: Symptom.Definition[];
    }

    interface SetNlpSymptoms extends Action {
      symptoms: any[],
      page: number,
      total: number,
    }

    interface ResetNlpSymptoms extends Action {
    }

    type SymptomsAction = 
        SetSymptomGroup
      | Upgrade
      | SetMultiplierSearch
      | SetSymptomDefinition
      | SetNlpSymptoms
      | ResetNlpSymptoms
  }
}

declare module "Symptoms" {
  export = Symptoms;
}
