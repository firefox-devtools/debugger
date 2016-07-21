const constants = require("../constants");
const { selectSource } = require("./sources");
const { PROMISE } = require("../utils/redux/middleware/promise");
const { Location, Frame } = require("../types");

const { getOriginalLocation } = require("../selectors");

function _updateFrame(state, frame) {
  const originalLocation = Location(getOriginalLocation(
    state,
    frame.location
  ));

  return Frame.update(frame, {
    $merge: { location: originalLocation }
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
    let { frame, why } = pauseInfo;
    frame = _updateFrame(getState(), frame);

    dispatch(selectSource(frame.location.sourceId));

    dispatch({
      type: constants.PAUSED,
      pauseInfo: { frame, why }
    });
  };
}

function loadedFrames(frames) {
  return {
    type: constants.LOADED_FRAMES,
    frames: frames
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

module.exports = {
  resumed,
  paused,
  loadedFrames,
  command,
  breakOnNext,
  selectFrame,
  loadObjectProperties
};
