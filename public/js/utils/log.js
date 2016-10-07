const { isDevelopment } = require("../feature");

function log() {
  if (!isDevelopment()) {
    return;
  }

  console.log.apply(console, ["[log]", ...arguments]);
}

module.exports = log;
