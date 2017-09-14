import type { ThunkArgs } from "./types";

export function setExpandedState(expanded) {
  return ({ dispatch, getState }: ThunkArgs) => {
    dispatch({
      type: "SET_EXPANDED_STATE",
      expanded
    });
  };
}
