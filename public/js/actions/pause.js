const constants = require("../constants");
const { selectSource } = require("./sources");
const { PROMISE } = require("../utils/redux/middleware/promise");

const { getExpressions } = require("../selectors");
const { updateFrameLocations } = require("../utils/pause");

/**
 * Debugger has just resumed
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
 */
function paused(pauseInfo) {
  return ({ dispatch, getState, client }) => {
    let { frame, frames, why } = pauseInfo;

    dispatch(evaluateExpressions());

    return dispatch({
      type: constants.PAUSED,
      [PROMISE]: (async function () {
        frames = await updateFrameLocations(getState(), frames);

        dispatch(selectSource(frame.location.sourceId));
        return {
          pauseInfo: { why, frame },
          frames: frames,
          selectedFrameId: frame.id
        };
      })()
    });
  };
}

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

function stepIn() {
  return command({ type: "stepIn" });
}

function stepOver() {
  return command({ type: "stepOver" });
}

function stepOut() {
  return command({ type: "stepOut" });
}

function resume() {
  return command({ type: "resume" });
}

/**
 * Debugger breakOnNext command.
 * It's different from the comand action because we also want to
 * highlight the pause icon.
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
 * TODO: Right now this if Firefox specific and is not implemented
 * for Chrome, which is why it takes a grip.
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
 * @param expression
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

function updateExpression(expression) {
  return ({ dispatch }) => {
    dispatch({
      type: constants.UPDATE_EXPRESSION,
      id: expression.id,
      input: expression.input
    });
  };
}

function deleteExpression(expression) {
  return ({ dispatch }) => {
    dispatch({
      type: constants.DELETE_EXPRESSION,
      id: expression.id
    });
  };
}

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
