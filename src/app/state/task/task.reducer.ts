import * as _ from "lodash";
import * as taskActions from "./task.actions";
import * as WorkbenchActions from "../workbench/workbench.actions";
import { TaskState } from "./task";
import { taskInit } from "app/app.config";

export function taskReducer(state: State.TaskState = taskInit, action: TaskState.Actions.TaskAction): State.TaskState {
  switch (action.type) {
    case taskActions.UPGRADE_TASK:
      return taskInit;
    case taskActions.CHECKED_PREVIOUS_VERSION:
      const checkedPreviousVersion = (action as TaskState.Actions.CheckedPreviousVersion).checkedPreviousVersion;
      return {
        ...state,
        checkedPreviousVersion
      };
    case taskActions.INSERT_LOCAL_ILLNESS:
      const illnesses = (<TaskState.Actions.PushToLocalIllnessTask>action).illness;
      const newLocalIllsData: Illness.Data[] = _.map(illnesses, i => ({
        idIcd10Code: i.idIcd10Code,
        name: i.name,
        version: i.version,
        chapterDescription: "My Edits"
      }));
      const allTasks = [...state.tasks];
      const localTaskIdx = _.findIndex(state.tasks, {"taskId": -1});
      if (~localTaskIdx) {
        const existingLocalIllsCodes = _.map(allTasks[localTaskIdx].illness, "idIcd10Code");
        const newLocalIlls: Illness.Data[] = _.reject(newLocalIllsData, i => ~_.indexOf(existingLocalIllsCodes, i.idIcd10Code)) as Illness.Data[];
        allTasks[localTaskIdx].illness = [
          ...allTasks[localTaskIdx].illness,
          ...newLocalIllsData
        ];
      } else {
        allTasks.push({
          taskId: -1,
          dateAssigned: new Date(),
          dateComplete: null,
          illness: newLocalIllsData
        });
      }
      return {
        ...state,
        tasks: allTasks,
      };
    case taskActions.SET_TASKS:
      const tasks = (<TaskState.Actions.TaskSet>action).tasks;
      return {...state, tasks};
    case WorkbenchActions.DELETE_ILLNESS:
      // 1. Remove illness from task
      const tasksP = [...state.tasks];
      let illnessIdx = -1;
      const taskIndex = _.findIndex((tasksP as any), task => {
        const illIdx = _.findIndex((task as any).illness, illness => {
          return (illness as any).idIcd10Code === (action as any).illness && (illness as any).version === (action as any).version
        });
        if (~illIdx) {
          illnessIdx = illIdx;
          return true;
        }
      });
      const taskInStore = tasksP[taskIndex];
      if (!taskInStore || !~illnessIdx) throw Error("Unable to remove illness from task");
      _.pullAt(taskInStore.illness, illnessIdx);

      // 2. remove task if that was the last illness
      if (!taskInStore.illness.length) {
        _.pullAt(tasksP, taskIndex);
      }

      return {
        ...state,
        tasks: tasksP
      };
    default:
      return state;
  }
}
