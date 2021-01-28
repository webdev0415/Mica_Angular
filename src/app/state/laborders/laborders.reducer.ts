import { laborersInit } from "../../app.config";
import { LabordersActions } from "./laborders";
import { SET_LABORDERS } from "./laborders.actions";


export function labordersReducer(state: State.LabordersState = laborersInit,
                              action: LabordersActions.SetLabOrders): State.LabordersState {

  switch (action.type) {
    case SET_LABORDERS:
      return { ...state, laborders: (<LabordersActions.SetLabOrders>action).payload };
    default:
      return state;
  }
}
