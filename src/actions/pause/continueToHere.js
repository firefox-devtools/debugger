// @flow

import { getSelectedSource } from "../../selectors";
import { addHiddenBreakpoint } from "../breakpoints";
import { resume } from "./commands";

import type { ThunkArgs } from "../types";

export function continueToHere(line: number) {
  return async function({ dispatch, getState }: ThunkArgs) {
    const source = getSelectedSource(getState()).toJS();

    await dispatch(
      addHiddenBreakpoint({
        line,
        column: undefined,
        sourceId: source.id
      })
    );

    dispatch(resume());
  };
}
