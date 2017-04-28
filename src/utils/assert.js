// @flow

export default function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failure: ${message}`);
  }
}
