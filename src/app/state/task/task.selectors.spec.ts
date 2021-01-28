import {defaultState} from "../../app.config";
import {isReadOnlyMode, isWorkingOnLocalEdits, localTask, tasksSelector} from "./task.selectors";
import TaskData = Task.Data;

describe("task selectors", () => {
  it("tasksSelector", () => {
    const state = {...defaultState};
    expect(tasksSelector(defaultState)).toEqual(state.task.tasks);
  });
  it("localTask", () => {
    const state = {...defaultState};
    const task = {taskId: -1} as TaskData;
    state.task.tasks.push(task);
    expect(localTask(defaultState)).toEqual(task);
  });
  it("isReadOnlyMode", () => {
    const state = {...defaultState};
    expect(isReadOnlyMode(state)).toBeFalsy();
  });
  it("isWorkingOnLocalEdits", () => {
    const state = {...defaultState};
    const task = {taskId: -1, illness: [{idIcd10Code: "17"}]} as TaskData;
    state.task.tasks.push(task);
    Object.assign(state, {workbench: {illnesses: {active: "17"}}});
    expect(isWorkingOnLocalEdits(state)).toBeTruthy();
  });
  it("isWorkingOnLocalEdits", () => {
    const state = {...defaultState};
    expect(isWorkingOnLocalEdits(state)).toBeFalsy();
  });
});
