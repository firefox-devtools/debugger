// @flow
import { isDevelopment } from "devtools-config";

export default function assert(condition: boolean, message: string) {
  if (isDevelopment() && !condition) {
    throw new Error(`Assertion failure: ${message}`);
  }
}
