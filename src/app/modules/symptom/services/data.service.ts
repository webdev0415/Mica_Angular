import { Injectable } from "@angular/core";
import { select, NgRedux } from "@angular-redux/store";
import { Observable } from "rxjs";
import * as _ from "lodash";
import { activeIllnessID } from "../../../state/workbench/workbench.selectors";
import { map } from "rxjs/operators";

@Injectable()
export class DataService {
  @select(["nav", "activeDescriptors"]) activeDescriptors$: Observable<State.ActiveDescriptors>;

  constructor(private store: NgRedux<State.Root>) { }

  isActiveDescriptor$(symptom: string, index: number): Observable<boolean> {
    return this.activeDescriptors$
      .pipe(
        map(descriptors => {
          const illness = activeIllnessID(this.store.getState());

          if (!illness) return false;

          const activeDescriptors = <number[]>_.get(descriptors, [illness, symptom]);
          return activeDescriptors && !!~_.indexOf(activeDescriptors, index);
        })
    );
  }

}
