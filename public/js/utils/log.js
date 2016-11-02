/* @flow */

const { isDevelopment } = require("devtools-config");

function log(...args: any[]) {
  if (!isDevelopment()) {
    return;
  }

  console.log.apply(console, ["[log]", ...args]);
}

module.exports = log;
