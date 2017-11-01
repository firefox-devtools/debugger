// @flow

import { selectSource } from "../sources";
import { evaluateExpressions } from "../expressions";
import { fetchScopes } from "./fetchScopes";

import type { Frame } from "../../types";
import type { ThunkArgs } from "../types";

/**
 * @memberof actions/pause
 * @static
 */
export function selectFrame(frame: Frame) {
  return async ({ dispatch, client, getState, sourceMaps }: ThunkArgs) => {
    dispatch({
      type: "SELECT_FRAME",
      frame
    });

    const { line, column } = frame.location;
    dispatch(selectSource(frame.location.sourceId, { line, column }));

    dispatch(evaluateExpressions());
    dispatch(fetchScopes());
  };
}
