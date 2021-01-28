import { createSelector } from "reselect";
import * as _ from "lodash";

const groupsSelector = (state: State.Root): State.GroupsState => state.groups;

export const allGroupsSelector = createSelector(
  groupsSelector,
  groups => groups.groups
);

export const findGroupsLive = (term: string) => createSelector(
  allGroupsSelector,
  (groups: Groups.Group[]) => {
    const t = term.trim().replace(/\s\s+/g, " ").toUpperCase();
    return t
      ? _.filter(_.values(groups), s => {
        const name = s.name.replace(/\s\s+/g, " ").toUpperCase();
        return name.includes(t);
      })
      : [];
  }
)
