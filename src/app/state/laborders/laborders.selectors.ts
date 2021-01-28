import { createSelector } from "reselect";

const labordersSelector = (state: State.Root): State.LabordersState => state.laborders;

export const allLabordersSelector = createSelector(
  labordersSelector,
  laborders => laborders.laborders
);
