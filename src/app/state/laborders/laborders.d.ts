import { Action } from "redux";

declare namespace LabordersActions {

  interface SetLabOrders extends Action {
    payload: Laborders.Laborder[];
  }
  
  type GroupsAction = SetLabOrders;

}
