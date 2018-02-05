/* -*- indent-tabs-mode: nil; js-indent-level: 2; js-indent-level: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { isPaused, getSelectedSource, getTopFrame } from "../../selectors";
import { PROMISE } from "../utils/middleware/promise";
import { getNextStep } from "../../workers/parser";
import { addHiddenBreakpoint } from "../breakpoints";
import { features } from "../../utils/prefs";

import type { ThunkArgs } from "../types";
type CommandType =
  | "stepOver"
  | "stepIn"
  | "stepOut"
  | "resume"
  | "rewind"
  | "reverseStepOver"
  | "reverseStepIn"
  | "reverseStepOut";

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
    if (isPaused(getState())) {
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
    if (isPaused(getState())) {
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
    if (isPaused(getState())) {
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
    if (isPaused(getState())) {
      return dispatch(command("resume"));
    }
  };
}

/**
 * rewind
 * @memberof actions/pause
 * @static
 * @returns {Function} {@link command}
 */
export function rewind() {
  return ({ dispatch, getState }: ThunkArgs) => {
    if (isPaused(getState())) {
      return dispatch(command("rewind"));
    }
  };
}

/**
 * reverseStepIn
 * @memberof actions/pause
 * @static
 * @returns {Function} {@link command}
 */
export function reverseStepIn() {
  return ({ dispatch, getState }: ThunkArgs) => {
    if (isPaused(getState())) {
      return dispatch(command("reverseStepIn"));
    }
  };
}

/**
 * reverseStepOver
 * @memberof actions/pause
 * @static
 * @returns {Function} {@link command}
 */
export function reverseStepOver() {
  return ({ dispatch, getState }: ThunkArgs) => {
    if (isPaused(getState())) {
      return dispatch(astCommand("reverseStepOver"));
    }
  };
}

/**
 * reverseStepOut
 * @memberof actions/pause
 * @static
 * @returns {Function} {@link command}
 */
export function reverseStepOut() {
  return ({ dispatch, getState }: ThunkArgs) => {
    if (isPaused(getState())) {
      return dispatch(command("reverseStepOut"));
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

    if (stepType == "stepOver") {
      // This type definition is ambiguous:
      const frame: any = getTopFrame(getState());
      const source = getSelectedSource(getState()).toJS();
      if (source) {
        const nextLocation = await getNextStep(source.id, frame.location);
        if (nextLocation) {
          await dispatch(addHiddenBreakpoint(nextLocation));
          return dispatch(command("resume"));
        }
      }
    }

    return dispatch(command(stepType));
  };
}
