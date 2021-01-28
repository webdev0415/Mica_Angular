import { ActionCreator } from "redux";
import { LabordersActions } from "./laborders";

export const SET_LABORDERS = "[laborders] Set laborders";

export const SetLabOrders: ActionCreator<LabordersActions.SetLabOrders> =
  (laborders: Laborders.Laborder[]) => ({
    type: SET_LABORDERS,
    payload: laborders
  });
