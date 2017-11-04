// @flow

import { getPause, getSelectedSource } from "../../selectors";
import { getPausedPosition } from "../../utils/pause";
import { PROMISE } from "../utils/middleware/promise";
import { getNextStep } from "../../workers/parser";
import { addHiddenBreakpoint } from "../breakpoints";
import { features } from "../../utils/prefs";

import type { ThunkArgs } from "../types";
type CommandType = "stepOver" | "stepIn" | "stepOut" | "resume";

/**
 * Debugger commands like stepOver, stepIn, stepUp
 *
 * @param string $0.type
 * @memberof actions/pause
 * @static
 */
export function command(type: CommandType) {
  return async ({ dispatch, client }: ThunkArgs) => {
    return dispatch({
      type: "COMMAND",
      command: type,
      [PROMISE]: client[type]()
    });
  };
}

/**
 * StepIn
 * @memberof actions/pause
 * @static
 * @returns {Function} {@link command}
 */
export function stepIn() {
  return ({ dispatch, getState }: ThunkArgs) => {
    if (getPause(getState())) {
      return dispatch(command("stepIn"));
    }
  };
}

/**
 * stepOver
 * @memberof actions/pause
 * @static
 * @returns {Function} {@link command}
 */
export function stepOver() {
  return ({ dispatch, getState }: ThunkArgs) => {
    if (getPause(getState())) {
      return dispatch(astCommand("stepOver"));
    }
  };
}

/**
 * stepOut
 * @memberof actions/pause
 * @static
 * @returns {Function} {@link command}
 */
export function stepOut() {
  return ({ dispatch, getState }: ThunkArgs) => {
    if (getPause(getState())) {
      return dispatch(command("stepOut"));
    }
  };
}

/**
 * resume
 * @memberof actions/pause
 * @static
 * @returns {Function} {@link command}
 */
export function resume() {
  return ({ dispatch, getState }: ThunkArgs) => {
    if (getPause(getState())) {
      return dispatch(command("resume"));
    }
  };
}

/**
 * @memberOf actions/pause
 * @static
 * @param stepType
 * @returns {function(ThunkArgs)}
 */
export function astCommand(stepType: CommandType) {
  return async ({ dispatch, getState, sourceMaps }: ThunkArgs) => {
    if (!features.asyncStepping) {
      return dispatch(command(stepType));
    }

    const pauseInfo = getPause(getState());
    const source = getSelectedSource(getState()).toJS();

    const pausedPosition = await getPausedPosition(pauseInfo, sourceMaps);

    if (stepType == "stepOver") {
      const nextLocation = await getNextStep(source, pausedPosition);
      if (nextLocation) {
        await dispatch(addHiddenBreakpoint(nextLocation));
        return dispatch(command("resume"));
      }
    }

    return dispatch(command(stepType));
  };
}
