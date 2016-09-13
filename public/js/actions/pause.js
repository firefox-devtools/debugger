const constants = require("../constants");
const { selectSource } = require("./sources");
const { PROMISE } = require("../utils/redux/middleware/promise");

const { getExpressions } = require("../selectors");
const { updateFrameLocations } = require("../utils/pause");

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
  return ({ dispatch, client }) => {
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
function paused(pauseInfo) {
  return async function({ dispatch, getState, client }) {
    let { frame, frames, why } = pauseInfo;
    frames = await updateFrameLocations(getState(), frames);

    dispatch(evaluateExpressions());
    dispatch({
      type: constants.PAUSED,
      pauseInfo: { why, frame },
      frames: frames,
      selectedFrameId: frame.id
    });
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
  shouldPauseOnExceptions, shouldIgnoreCaughtExceptions) {
  return ({ dispatch, client }) => {
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
function command({ type }) {
  return ({ dispatch, client }) => {
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
  return command({ type: "stepIn" });
}

/**
 * stepOver
 * @memberof actions/pause
 * @static
 * @returns {Function} {@link command}
 */
function stepOver() {
  return command({ type: "stepOver" });
}

/**
 * stepOut
 * @memberof actions/pause
 * @static
 * @returns {Function} {@link command}
 */
function stepOut() {
  return command({ type: "stepOut" });
}

/**
 * resume
 * @memberof actions/pause
 * @static
 * @returns {Function} {@link command}
 */
function resume() {
  return command({ type: "resume" });
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
  return ({ dispatch, client }) => {
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
function selectFrame(frame) {
  return ({ dispatch }) => {
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
function loadObjectProperties(grip) {
  return ({ dispatch, client }) => {
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
function addExpression(expression) {
  return ({ dispatch, getState }) => {
    const id = expression.id !== undefined ? parseInt(expression.id, 10) :
      getExpressions(getState()).toSeq().size++;
    dispatch({
      type: constants.ADD_EXPRESSION,
      id: id,
      input: expression.input
    });
    dispatch(evaluateExpressions());
  };
}

/**
 *
 * @param {object} expression
 * @param {number} expression.id
 * @memberof actions/pause
 * @static
 */
function updateExpression(expression) {
  return ({ dispatch }) => {
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
function deleteExpression(expression) {
  return ({ dispatch }) => {
    dispatch({
      type: constants.DELETE_EXPRESSION,
      id: expression.id
    });
  };
}

/**
 *
 * @memberof actions/pause
 * @static
 */
function evaluateExpressions() {
  return ({ dispatch, getState, client }) => {
    for (let expression of getExpressions(getState())) {
      dispatch({
        type: constants.EVALUATE_EXPRESSION,
        id: expression.id,
        input: expression.input,
        [PROMISE]: client.evaluate(expression.input)
      });
    }
  };
}

module.exports = {
  addExpression,
  updateExpression,
  deleteExpression,
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
