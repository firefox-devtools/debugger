const constants = require("../constants");
const { selectSource } = require("./sources");
const { PROMISE } = require("../utils/redux/middleware/promise");
const { Location, Frame } = require("../types");

const { getExpressions } = require("../selectors");
const { getOriginalLocation } = require("../utils/source-map");
const { asyncMap } = require("../utils/utils");

async function updateFrame(state, frame) {
  const originalLocation = await getOriginalLocation(
    state,
    frame.location
  );

  return Frame.update(frame, {
    $merge: { location: Location(originalLocation) }
  });
}

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
        frame = await updateFrame(getState(), frame);

        frames = await asyncMap(frames, item => {
          return updateFrame(getState(), item);
        });

        dispatch(selectSource(frame.location.sourceId));
        return {
          pauseInfo: { why, frame },
          frames: frames
        };
      })()
    });
  };
}

function pauseOnExceptions(toggle) {
  return ({ dispatch, getState, client }) => {
    client.pauseOnExceptions(toggle);
    return dispatch({
      type: constants.PAUSE_ON_EXCEPTIONS,
      toggle
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
      frame: frame
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
    dispatch({
      type: constants.ADD_EXPRESSION,
      id: expression.id || `${getExpressions(getState()).toSeq().size++}`,
      input: expression.input
    });
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
  resumed,
  paused,
  pauseOnExceptions,
  command,
  breakOnNext,
  selectFrame,
  loadObjectProperties
};
