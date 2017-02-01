const prettyPrint = require("./tests/pretty-print")
const { setupTestRunner } = require("./utils/mocha")
const { isDevelopment } = require("devtools-config");

if (isDevelopment()) {
  require("./runner");
}

module.exports = {
  setupTestRunner,
  prettyPrint
}
