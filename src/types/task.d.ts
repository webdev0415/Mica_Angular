declare module Task {
  interface Data {
    taskId: number;
    dateAssigned: Date;
    dateComplete: Date | null;
    illness: Illness.Data[];
  }

  interface SyncIllness extends Illness.FormValue {
    userID: number;
    criticality?: number;
  }

  type SyncIllnessResponse = Readonly<{
    status: string;
    count: number;
    icd10CodesStatus: string[];
  }>

  type SymptomErrorName = "type" | "length" | "required" | "pattern";

  type IllnessRootError = Readonly<{
    groupsComplete?: string;
  }>

  type ActiveIllnessError = Readonly<{
    illness: IllnessRootError;
    symptoms: {
      [symptomGroup: string]: Symptom.ValueError[];
    }
  }>
}