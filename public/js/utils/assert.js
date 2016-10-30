function assert(condition :any, message: string) {
  if (!condition) {
    throw new Error("Assertion failure: " + message);
  }
}

module.exports = assert;
