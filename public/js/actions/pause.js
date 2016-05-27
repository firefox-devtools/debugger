"use strict";

const constants = require("../constants");
const { selectSource } = require("./sources");

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
    const { location } = pauseInfo.frame;

    dispatch(selectSource(location.sourceId, {
      line: location.line
    }));

    dispatch({
      type: constants.PAUSED,
      pauseInfo: pauseInfo
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

module.exports = {
  resumed,
  paused,
  loadedFrames,
  command,
  breakOnNext,
  selectFrame
};
