// @flow

function assert(condition, message) {
  if (!condition) {
    throw new Error("Assertion failure: " + message);
  }
}

module.exports = assert;
