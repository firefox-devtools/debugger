"use strict";

const constants = require("../constants");

/**
 * Debugger has just resumed
 */
function resumed() {
  return ({ dispatch, threadClient }) => {
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
  return ({ dispatch }) => {
    return dispatch({
      type: constants.PAUSED,
      value: pauseInfo
    });
  };
}

/**
 * Debugger commands like stepOver, stepIn, stepUp
 */
function command({type}) {
  return ({ dispatch, threadClient }) => {
    // execute debugger thread command e.g. stepIn, stepOver
    threadClient[type]();

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
  return ({ dispatch, threadClient }) => {
    threadClient.breakOnNext();

    return {
      type: constants.BREAK_ON_NEXT,
      value: true
    };
  };
}

module.exports = {
  resumed,
  paused,
  command,
  breakOnNext
};
