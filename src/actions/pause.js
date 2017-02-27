// @flow
const constants = require("../constants");
const { selectSource } = require("./sources");
const { PROMISE } = require("../utils/redux/middleware/promise");

const { getPause, getLoadedObject } = require("../selectors");
const { updateFrameLocations } = require("../utils/pause");
const { evaluateExpressions } = require("./expressions");

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
function resumed() {
  return ({ dispatch, client }: ThunkArgs) => {
    // dispatch(evaluateExpressions(null));

    return dispatch({
      type: constants.RESUME,
      value: undefined
    });
  };
}

/**
 * Debugger has just paused
 *
 * @param {object} pauseInfo
 * @memberof actions/pause
 * @static
 */
function paused(pauseInfo: Pause) {
  return async function({ dispatch, getState, client }: ThunkArgs) {
    let { frames, why, loadedObjects } = pauseInfo;
    frames = await updateFrameLocations(frames);
    const frame = frames[0];

    dispatch({
      type: constants.PAUSED,
      pauseInfo: { why, frame },
      frames: frames,
      selectedFrameId: frame.id,
      loadedObjects: loadedObjects || []
    });

    dispatch(evaluateExpressions(frame.id));

    dispatch(selectSource(frame.location.sourceId,
                          { line: frame.location.line }));
  };
}

/**
 *
 * @memberof actions/pause
 * @static
 */
function pauseOnExceptions(
  shouldPauseOnExceptions: boolean, shouldIgnoreCaughtExceptions: boolean) {
  return ({ dispatch, client }: ThunkArgs) => {
    dispatch({
      type: constants.PAUSE_ON_EXCEPTIONS,
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
function command({ type }: CommandType) {
  return ({ dispatch, client }: ThunkArgs) => {
    // execute debugger thread command e.g. stepIn, stepOver
    client[type]();

    return dispatch({
      type: constants.COMMAND,
      value: undefined
    });
  };
}

/**
 * StepIn
 * @memberof actions/pause
 * @static
 * @returns {Function} {@link command}
 */
function stepIn() {
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
function stepOver() {
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
function stepOut() {
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
function resume() {
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
function breakOnNext() {
  return ({ dispatch, client }: ThunkArgs) => {
    client.breakOnNext();

    return dispatch({
      type: constants.BREAK_ON_NEXT,
      value: true
    });
  };
}

/**
 * Select a frame
 *
 * @param frame
 * @memberof actions/pause
 * @static
 */
function selectFrame(frame: Frame) {
  return ({ dispatch }: ThunkArgs) => {
    dispatch(evaluateExpressions(frame.id));
    dispatch(selectSource(frame.location.sourceId,
                          { line: frame.location.line }));
    dispatch({
      type: constants.SELECT_FRAME,
      frame
    });
  };
}

/**
 * Load an object.
 *
 * @param grip
 * TODO: Right now this is Firefox specific and is not implemented
 * for Chrome, which is why it takes a grip.
 * @memberof actions/pause
 * @static
 */
function loadObjectProperties(object: any) {
  return ({ dispatch, client, getState }: ThunkArgs) => {
    const objectId = object.actor || object.objectId;

    if (getLoadedObject(getState(), objectId)) {
      return;
    }

    dispatch({
      type: constants.LOAD_OBJECT_PROPERTIES,
      objectId,
      [PROMISE]: client.getProperties(object)
    });
  };
}

module.exports = {
  resumed,
  paused,
  pauseOnExceptions,
  command,
  stepIn,
  stepOut,
  stepOver,
  resume,
  breakOnNext,
  selectFrame,
  loadObjectProperties
};
