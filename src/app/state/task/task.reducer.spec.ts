import {taskReducer} from "./task.reducer";
import {taskInit} from "../../app.config";
import {CHECKED_PREVIOUS_VERSION, INSERT_LOCAL_ILLNESS, SET_TASKS, UPGRADE_TASK} from "./task.actions";
import TaskData = Task.Data;
import IllnessData = Illness.Data;
import {DELETE_ILLNESS} from "../workbench/workbench.actions";
import * as _ from "lodash";


describe("taskReducer", () => {
  it("UPGRADE_TASK", () => {
    const taskState = {...taskInit, checkedPreviousVersion: true};
    const action = {
      type: UPGRADE_TASK
    };
    expect(taskReducer(taskState, action as any)).toEqual(taskInit);
  });
  it("CHECKED_PREVIOUS_VERSION", () => {
    const taskState = _.cloneDeep(taskInit);
    const action = {
      type: CHECKED_PREVIOUS_VERSION,
      checkedPreviousVersion: true
    };
    expect(taskReducer(taskState, action).checkedPreviousVersion).toBeTruthy();
  });
  it("SET_TASKS", () => {
    const taskState = _.cloneDeep(taskInit);
    const task = {taskId: 17} as TaskData;
    const tasks = [task];
    const action = {
      type: SET_TASKS,
      tasks: tasks
    };
    expect(taskReducer(taskState, action).tasks[0]).toEqual(task);
  });
  it("INSERT_LOCAL_ILLNESS", () => {
    const taskState = _.cloneDeep(taskInit);
    const illness = {idIcd10Code: "17"} as IllnessData;
    const illnesses = [illness];
    const action = {
      type: INSERT_LOCAL_ILLNESS,
      illness: illnesses
    };
    expect(taskReducer(taskState, action as any).tasks[0].illness.length).toEqual(1);
  });
  it("DELETE_ILLNESS", () => {
    const taskState = _.cloneDeep(taskInit);
    const illness = {
      idIcd10Code: "17",
      version: 1
    } as IllnessData;
    const task = {illness: [illness]} as TaskData;
    taskState.tasks.push(task);
    const action = {
      type: DELETE_ILLNESS,
      illness: "17",
      version: 1
    };
    expect(taskReducer(taskState, action as any).tasks.length).toEqual(0);
  });
  it("DELETE_ILLNESS throws", () => {
    const taskState = _.cloneDeep(taskInit);
    const illness = {
      idIcd10Code: "18",
      version: 2
    } as IllnessData;
    const task = {illness: [illness]} as TaskData;
    taskState.tasks.push(task);
    const action = {
      type: DELETE_ILLNESS,
      illness: "17",
      version: 1
    };
    expect(() => taskReducer(taskState, action as any)).toThrow(jasmine.any(Error));
  });

  it("DELETE_ILLNESS", () => {
    const taskState = _.cloneDeep(taskInit);
    const illness = {
      idIcd10Code: "17",
      version: 1
    } as IllnessData;
    const task = {illness: [illness, illness]} as TaskData;
    taskState.tasks.push(task);
    const action = {
      type: DELETE_ILLNESS,
      illness: "17",
      version: 1
    };
    expect(taskReducer(taskState, action as any).tasks.length).toEqual(1);
    taskState.tasks = [];
  });

  it("INSERT_LOCAL_ILLNESS", () => {
    const s = _.cloneDeep(taskInit);
    Object.assign(s, {
      tasks: [
        {
          taskId: -1,
          illness: [{
            idIcd10Code: "A"
          }]
        }
      ]
    });
    const illnesses = [
      {
        idIcd10Code: "A",
        name: "name",
        version: 1
      }
    ];
    const action = {
      type: INSERT_LOCAL_ILLNESS,
      illness: illnesses
    };
    expect(taskReducer(s, action as any)).toBeDefined();

  });
});
