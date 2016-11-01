// @flow

const { isDevelopment } = require("devtools-config");

function log() {
  if (!isDevelopment()) {
    return;
  }

  console.log.apply(console, ["[log]", ...arguments]);
}

module.exports = log;
