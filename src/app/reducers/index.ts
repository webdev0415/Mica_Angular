import {
  ActionReducerMap,
  MetaReducer
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import { reducer as sourcesReducer } from '../state/source/source.reducer';

export interface State {
  sources: State.Sources
}

export const reducers: ActionReducerMap<State> = {
  sources: sourcesReducer
};

export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
