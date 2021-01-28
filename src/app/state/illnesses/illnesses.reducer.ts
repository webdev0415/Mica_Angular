import { illnessesInit } from "../../app.config";
import { Illnesses } from "./illnesses";
import * as IllnessesActions from "./illnesses.actions";
import * as _ from "lodash";

export function illnessesReducer(
  state: State.IllnessesState = illnessesInit,
  action: Illnesses.Actions.SetIllnesses): State.IllnessesState {
  switch (action.type) {
    case IllnessesActions.SET_ILLNESSES:
      const illnesses: Illness.DataShort[] = (<Illnesses.Actions.SetIllnesses>action).illnesses;
      const cacheObj: { [key: string]: string } = {};
      const uniqueIllnesses = _.filter(illnesses, (illness: Illness.DataShort) => {
        const code = illness.icd10Code;
        const notInCache = !cacheObj[code];
        if (notInCache) {
          cacheObj[code] = code;
        }
        return notInCache;
      });
      return {illnesses: uniqueIllnesses};

    default:
      return state;
  }
}
