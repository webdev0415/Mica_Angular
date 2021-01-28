import { createSelector } from "reselect";
import * as _ from "lodash";
import * as workbenchSelectors from "../workbench/workbench.selectors";

const taskSelector = (state: State.Root) => state.task;
export const tasksSelector = (state: State.Root) => state.task.tasks;
const readOnlyIllness = (state: State.Root) => workbenchSelectors.readOnlyIllness(state);
const activeIllnessID = (state: State.Root) => workbenchSelectors.activeIllnessID(state);


/**
 * Task
 */

export const localTask = createSelector(
  taskSelector,
  task => _.find(task.tasks, {"taskId": -1 })
);

/**
 * Illness
 */

export const isReadOnlyMode = createSelector(
  readOnlyIllness,
  r => !!r
);

export const isWorkingOnLocalEdits = createSelector(
  activeIllnessID,
  tasksSelector,
  (id, tasks) => {
    const task = _.find((tasks as any), t => _.find((t as Task.Data).illness, ill => ill.idIcd10Code === id) as any);
    if (!task) return false;
    return (task as Task.Data).taskId === -1;
  }
);




