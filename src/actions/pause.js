// @flow

import { selectSource } from "./sources";
import { PROMISE } from "../utils/redux/middleware/promise";

import { getPause, getLoadedObject, isStepping } from "../selectors";
import { updateFrameLocations } from "../utils/pause";
import { evaluateExpressions } from "./expressions";

import type { Pause, Frame } from "../types";
import type { ThunkArgs } from "./types";

type CommandType = { type: string };

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
    dispatch({
      type: "RESUME",
      value: undefined
    });

    if (!isStepping(getState())) {
      dispatch(evaluateExpressions(null));
    }
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

    dispatch(evaluateExpressions(frame.id));

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
export function command({ type }: CommandType) {
  return ({ dispatch, client }: ThunkArgs) => {
    // execute debugger thread command e.g. stepIn, stepOver
    client[type]().then(() => dispatch({ type: "CLEAR_COMMAND" }));

    return dispatch({
      type: "COMMAND",
      value: { type }
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
      return dispatch(command({ type: "stepIn" }));
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
      return dispatch(command({ type: "stepOver" }));
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
      return dispatch(command({ type: "stepOut" }));
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
      return dispatch(command({ type: "resume" }));
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
