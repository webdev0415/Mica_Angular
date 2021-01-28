import {ActionCreator} from "redux";
import {Illnesses} from "./illnesses.d";

export const SET_ILLNESSES = "[Illnesses] Set illnesses";

export const setIllnesses: ActionCreator<Illnesses.Actions.SetIllnesses> =
  (illnesses: Illness.DataShort[]) => ({
    type: SET_ILLNESSES,
    illnesses: illnesses
  });
