// @flow
const constants = require("../constants");
const { selectSource } = require("./sources");
const { PROMISE } = require("../utils/redux/middleware/promise");

const { getExpressions, getSelectedFrame, getPause } = require("../selectors");
const { updateFrameLocations } = require("../utils/pause");

import type { Pause, Frame, Expression, Grip } from "../types";
import type { ThunkArgs } from "./types";

type CommandType = { type: string };
type frameIdType = string | null;

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
    dispatch(evaluateExpressions(null));

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
    let { frames, why } = pauseInfo;
    frames = await updateFrameLocations(frames);
    const frame = frames[0];

    dispatch({
      type: constants.PAUSED,
      pauseInfo: { why, frame },
      frames: frames,
      selectedFrameId: frame.id
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
 * TODO: Right now this if Firefox specific and is not implemented
 * for Chrome, which is why it takes a grip.
 * @memberof actions/pause
 * @static
 */
function loadObjectProperties(grip: Grip) {
  return ({ dispatch, client }: ThunkArgs) => {
    dispatch({
      type: constants.LOAD_OBJECT_PROPERTIES,
      objectId: grip.actor,
      [PROMISE]: client.getProperties(grip)
    });
  };
}

/**
 * Add expression for debugger to watch
 *
 * @param {object} expression
 * @param {number} expression.id
 * @memberof actions/pause
 * @static
 */
function addExpression(expression: Expression) {
  return ({ dispatch, getState }: ThunkArgs) => {
    if (!expression.input) {
      return;
    }

    const expressions = getExpressions(getState()).toSeq();
    const matchedExpression = expressions
      .find(e => e.input === expression.input);
    if (matchedExpression !== undefined) {
      return;
    }
    const id = expression.id !== undefined ? parseInt(expression.id, 10) :
      expressions.size++;
    dispatch({
      type: constants.ADD_EXPRESSION,
      id: id,
      input: expression.input
    });
    const selectedFrame = getSelectedFrame(getState());
    const selectedFrameId = selectedFrame ? selectedFrame.id : null;
    dispatch(evaluateExpressions(selectedFrameId));
  };
}

/**
 *
 * @param {object} expression
 * @param {number} expression.id
 * @memberof actions/pause
 * @static
 */
function updateExpression(expression: Expression) {
  return ({ dispatch }: ThunkArgs) => {
    dispatch({
      type: constants.UPDATE_EXPRESSION,
      id: expression.id,
      input: expression.input
    });
  };
}

/**
 *
 * @param {object} expression
 * @param {number} expression.id
 * @memberof actions/pause
 * @static
 */
function deleteExpression(expression: Expression) {
  return ({ dispatch }: ThunkArgs) => {
    dispatch({
      type: constants.DELETE_EXPRESSION,
      id: expression.id
    });
  };
}

/**
 *
 * @memberof actions/pause
 * @param {number} selectedFrameId
 * @static
 */
function evaluateExpressions(frameId: frameIdType) {
  return async function({ dispatch, getState, client }: ThunkArgs) {
    for (let expression of getExpressions(getState())) {
      if (!expression.input) {
        console.warn("Expressions should not be empty");
        continue;
      }

      await dispatch({
        type: constants.EVALUATE_EXPRESSION,
        id: expression.id,
        input: expression.input,
        [PROMISE]: client.evaluate(expression.input, { frameId })
      });
    }
  };
}

module.exports = {
  addExpression,
  updateExpression,
  deleteExpression,
  evaluateExpressions,
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
