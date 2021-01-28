declare module ECW {

  type State = "LOADED" | "FINAL";
  type OtherState = "ALL" | "REVIEWED";
  export type AnyState = State | OtherState;

  interface Illness {
    icd10Code: string;
    name: string;
    status: State;
    version: number;
  }

  interface Response {
    content: Illness[];
    first: Boolean;
    pagenumber: number;
    pageSize: number;
    totalElements: number;
    elementsInPage: number;
    last: Boolean;
  }

  interface Params {
    filter: AnyState,
    page: number,
    pageSize: number,
  }

  interface IllnessData extends Illness.FormValue {
    state: Illness.State,
    source: "ECW",
  }

  interface Validation {
    illness: ECW.IllnessData | null;
    symptoms: { [id: string]: Symptom.Value } | null;
    missingData: ECW.MissingData | null;
  }

  interface MissingData { [idx: string]: { [idx: string]: Illness.Normalized.FormValueCategory }}
}
