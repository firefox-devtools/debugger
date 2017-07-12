import { PROMISE } from "../../utils/redux/middleware/promise";
import api from "./apis";

export function thunkedDispatch(action) {
  return ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    console.log(action);
    const promise = api[action.type](getState, client, sourceMaps, action);
    return dispatch({ ...action, [PROMISE]: promise });
  };
}
