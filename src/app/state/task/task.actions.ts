import { ActionCreator } from "redux";
import { TaskState } from "./task";

export const SET_TASKS = "[Task] Set assigned tasks";
export const CHECKED_PREVIOUS_VERSION = "[Task] Check previous version of tasks";
export const UPGRADE_TASK = "[Task] Upgrade";
export const INSERT_LOCAL_ILLNESS = "[Task] Insert Illnesses into Local Task";

export const setTasks: ActionCreator<TaskState.Actions.TaskSet> =
  (tasks: Task.Data[]) => ({
    type: SET_TASKS,
    tasks: tasks
  });
export const checkedPreviousVersion: ActionCreator<TaskState.Actions.CheckedPreviousVersion> =
  (checked: boolean) => ({
    type: CHECKED_PREVIOUS_VERSION,
    checkedPreviousVersion: checked
  });

export const insertLocalIllness: ActionCreator<TaskState.Actions.PushToLocalIllnessTask> =
  (illness: Illness.FormValue[]) => ({ type: INSERT_LOCAL_ILLNESS, illness });
