import {
  applyMiddleware,
  Dispatch,
  Store,
  compose,
  createStore
} from "redux";
// import { environment } from "../../environments/environment";
import { rootReducer } from "./root.reducer";
import ReduxThunk from "redux-thunk";
import { WebStorage } from "./web.storage";


const composeEnhancers = (<any>window).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const webStorage = new WebStorage("MICA");
const reducerWithStorage = webStorage.persistState(rootReducer);
/* istanbul ignore next */
export const store: Store<State.Root> =   createStore(
  reducerWithStorage,
  composeEnhancers(applyMiddleware(
    ReduxThunk
    )
  )
);
  // environment.production
  // ? createStore(reducerWithStorage, compose(applyMiddleware(ReduxThunk)))
  // :


/* istanbul ignore next */
export const wrapState: (dispatchLoad: any) => (dispatch: Dispatch<any>, getState: () => State.Root) => Dispatch<any> =
  dispatchLoad => (dispatch, getState) => dispatch({...dispatchLoad, stateRoot: getState()});
