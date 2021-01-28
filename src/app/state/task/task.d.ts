import { Action } from "redux";
import { SetReadOnlyIllness } from "../workbench/workbench.actions";

declare namespace TaskState {

  /**
   *   ACTIONS
   */
  namespace Actions {

    interface TaskSet extends Action {
      tasks: Task.Data[];
    }

    interface CheckedPreviousVersion extends Action {
      checkedPreviousVersion: boolean;
    }

    interface SetSymptomGroupCompleteStatus extends Action {
      groupID: string;
      value: boolean;
    }

    interface CopySymptoms extends Action {
      sgID: string;
      sectionID: string | null;
      catID: string;
      symptoms: Symptom.Value[];
    }

    interface InsertNewUserDataIllness extends Action {
      illnessValue: Illness.FormValue;
    }

    interface DeleteSymptom extends Action {
      path: Symptom.LocationValue;
      symptomID: string;
    }

    interface PushToLocalIllnessTask extends Action {
      illness: Illness.FormValue[];
    }

    type TaskAction =
      | TaskSet
      | InsertNewUserDataIllness
      | CheckedPreviousVersion
      | CopySymptoms
      | DeleteSymptom
      | SetReadOnlyIllness
      | PushToLocalIllnessTask
      | CheckedPreviousVersion;
  }
}

declare module "TaskState" {
  export = TaskState;
}
