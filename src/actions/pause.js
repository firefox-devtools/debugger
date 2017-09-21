// @flow

import { selectSource } from "./sources";
import { PROMISE } from "../utils/redux/middleware/promise";

import {
  getPause,
  getLoadedObject,
  isStepping,
  isPaused,
  getSelectedSource,
  hasWatchExpressionErrored
} from "../selectors";
import { updateFrameLocations, getPausedPosition } from "../utils/pause";
import { evaluateExpressions } from "./expressions";

import { addHiddenBreakpoint, removeBreakpoint } from "./breakpoints";
import { getHiddenBreakpointLocation } from "../reducers/breakpoints";
import * as parser from "../utils/parser";
import { features } from "../utils/prefs";

import type { Pause, Frame } from "../types";
import type { ThunkArgs } from "./types";

type CommandType = string;

/**
 * Redux actions for the pause state
 * @module actions/pause
 */

/**
 * Debugger has just resumed
 *
 * @memberof actions/pause
 * @static
 */
export function resumed() {
  return ({ dispatch, client, getState }: ThunkArgs) => {
    if (!isPaused(getState())) {
      return;
    }

    dispatch({
      type: "RESUME",
      value: undefined
    });

    if (!isStepping(getState())) {
      dispatch(evaluateExpressions(null));
    }
  };
}

export function continueToHere(line: number) {
  return async function({ dispatch, getState, client, sourceMaps }: ThunkArgs) {
    const source = getSelectedSource(getState()).toJS();

    await dispatch(
      addHiddenBreakpoint({
        line,
        column: undefined,
        sourceId: source.id
      })
    );

    dispatch(command("resume"));
  };
}

/**
 * Debugger has just paused
 *
 * @param {object} pauseInfo
 * @memberof actions/pause
 * @static
 */
export function paused(pauseInfo: Pause) {
  return async function({ dispatch, getState, client, sourceMaps }: ThunkArgs) {
    let { frames, why, loadedObjects } = pauseInfo;
    console.log("PAUSED");
    frames = await updateFrameLocations(frames, sourceMaps);
    const frame = frames[0];

    const scopes = await client.getFrameScopes(frame);

    dispatch({
      type: "PAUSED",
      pauseInfo: { why, frame, frames },
      frames: frames,
      scopes,
      selectedFrameId: frame.id,
      loadedObjects: loadedObjects || []
    });

    const hiddenBreakpointLocation = getHiddenBreakpointLocation(getState());
    if (hiddenBreakpointLocation) {
      dispatch(removeBreakpoint(hiddenBreakpointLocation));
    }

    // NOTE: We don't want to re-evaluate watch expressions
    // if we're paused due to an excpression exception #3597
    if (!hasWatchExpressionErrored(getState())) {
      dispatch(evaluateExpressions(frame.id));
    }

    dispatch(
      selectSource(frame.location.sourceId, { line: frame.location.line })
    );
  };
}

/**
 *
 * @memberof actions/pause
 * @static
 */
export function pauseOnExceptions(
  shouldPauseOnExceptions: boolean,
  shouldIgnoreCaughtExceptions: boolean
) {
  return ({ dispatch, client }: ThunkArgs) => {
    dispatch({
      type: "PAUSE_ON_EXCEPTIONS",
      shouldPauseOnExceptions,
      shouldIgnoreCaughtExceptions,
      [PROMISE]: client.pauseOnExceptions(
        shouldPauseOnExceptions,
        shouldIgnoreCaughtExceptions
      )
    });
  };
}

/**
 * Debugger commands like stepOver, stepIn, stepUp
 *
 * @param string $0.type
 * @memberof actions/pause
 * @static
 */
export function command(type: CommandType) {
  return async ({ dispatch, client }: ThunkArgs) => {
    dispatch({
      type: "COMMAND",
      command: type,
      [PROMISE]: (async () => {
        await client[type]();
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log("done stepping");
      })()
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
 * Debugger breakOnNext command.
 * It's different from the comand action because we also want to
 * highlight the pause icon.
 *
 * @memberof actions/pause
 * @static
 */
export function breakOnNext() {
  return ({ dispatch, client }: ThunkArgs) => {
    client.breakOnNext();

    return dispatch({
      type: "BREAK_ON_NEXT",
      value: true
    });
  };
}

/**
 * @memberof actions/pause
 * @static
 */
export function selectFrame(frame: Frame) {
  return async ({ dispatch, client }: ThunkArgs) => {
    dispatch(evaluateExpressions(frame.id));
    dispatch(
      selectSource(frame.location.sourceId, { line: frame.location.line })
    );

    const scopes = await client.getFrameScopes(frame);

    dispatch({
      type: "SELECT_FRAME",
      frame,
      scopes
    });
  };
}

/**
 * @memberof actions/pause
 * @static
 */
export function loadObjectProperties(object: any) {
  return ({ dispatch, client, getState }: ThunkArgs) => {
    const objectId = object.actor || object.objectId;

    if (getLoadedObject(getState(), objectId)) {
      return;
    }

    dispatch({
      type: "LOAD_OBJECT_PROPERTIES",
      objectId,
      [PROMISE]: client.getProperties(object)
    });
  };
}

/**
 * @memberOf actions/pause
 * @static
 * @param stepType
 * @returns {function(ThunkArgs)}
 */
export function astCommand(stepType: string) {
  return async ({ dispatch, getState, sourceMaps }: ThunkArgs) => {
    if (!features.asyncStepping) {
      return dispatch(command(stepType));
    }

    const pauseInfo = getPause(getState());
    const source = getSelectedSource(getState()).toJS();

    const pausedPosition = await getPausedPosition(pauseInfo, sourceMaps);

    if (stepType == "stepOver") {
      const nextLocation = await parser.getNextStep(source, pausedPosition);
      if (nextLocation) {
        await dispatch(addHiddenBreakpoint(nextLocation));
        return dispatch(command("resume"));
      }
    }

    return dispatch(command(stepType));
  };
}
