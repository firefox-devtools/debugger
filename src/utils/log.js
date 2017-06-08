/* @flow */

/**
 *
 * Utils for logging to the console
 * Suppresses logging in non-development environment
 *
 * @module utils/log
 */

import { isDevelopment } from "devtools-config";

/**
 * Produces a formatted console log line by imploding args, prefixed by [log]
 *
 * function input: log(["hello", "world"])
 * console output: [log] hello world
 *
 * @memberof utils/log
 * @static
 */
export function log(...args: any[]) {
  if (!isDevelopment()) {
    return;
  }

  console.log.apply(console, ["[log]", ...args]);
}
