import { Action, Reducer } from "redux";
import * as _ from "lodash";
import { defaultState } from "../app.config";

export class WebStorage {

  private key: string;
  private storageArea: Storage;
  private defaultState: State.Root;

  /* istanbul ignore next */
  constructor(key: string,
              /* istanbul ignore next */
              storageArea = window.localStorage,
  ) {
    this.key = key;
    this.storageArea = storageArea;
    this.defaultState = defaultState;
  }

  persistState(reducer: Reducer<State.Root>): Reducer<State.Root> {
    return (
      /* istanbul ignore next */
      state = this.storedState,
      action: Action) => {
        switch (action.type) {
          case "RESET_STATE":
            this.clear();
            return reducer(_.cloneDeep(this.defaultState), {type: null});
          default:
            const newState = reducer(state, action);
            // disable saving to localStorage
            // this.save(newState);
            return newState;
        }
      };
  }

  get storedState() {
    return this.load();
  }

  load(): State.Root  {
    const serialized = this.storageArea.getItem(this.key);
    return serialized === null ? this.defaultState : this.deserialize(serialized);
  }

  /**
   * Save a JSON serializable object into the data store
   *
   * @param {any} data [description]
   */
  save(data: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        if (data === undefined) {
           this.storageArea.removeItem(this.key);
        } else {
           this.storageArea.setItem(this.key, this.serialize(data));
        }
        resolve(true);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Clear this storage section from the storage area
   */
  clear(): void {
    this.storageArea.removeItem(this.key);
  }

  private serialize(value: State.Root) {
    // const state: any = _.cloneDeep(value);
    // state.task.activeIllness.symptomsChecked = Array.from(state.task.activeIllness.symptomsChecked);
    return JSON.stringify(value);
  }

  private deserialize(value: string): State.Root {
    const state = JSON.parse(value);
    // if (state) {
    //   state.task.activeIllness.symptomsChecked = new Set(state.task.activeIllness.symptomsChecked);
    // }
    return state;
  }

}
