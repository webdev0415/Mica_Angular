import { createSelector } from "reselect";

const userSelector = (state: State.Root) => state.user;

export const roleID = createSelector(
  userSelector,
  user => user.roleID
);

export const isReviewer = createSelector(
  roleID,
  id => id === 2
);

export const userID = createSelector(
  userSelector,
  u => u.userID
);
