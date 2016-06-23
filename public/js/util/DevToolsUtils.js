"use strict";

function reportException(who, exception) {
  let msg = who + " threw an exception: ";
  console.error(msg, exception);
}

function assert(condition, message) {
  if (!condition) {
    const err = new Error("Assertion failure: " + message);
    reportException("DevToolsUtils.assert", err);
    throw err;
  }
}

function executeSoon(fn) {
  setTimeout(fn, 0);
}

module.exports = {
  reportException,
  executeSoon,
  assert
};
