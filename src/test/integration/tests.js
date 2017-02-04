const prettyPrint = require("./tests/pretty-print");
const breaking = require("./tests/breaking");
const { setupTestRunner } = require("./utils/mocha")
const { isDevelopment } = require("devtools-config");

if (isDevelopment()) {
  require("./runner");
}

module.exports = {
  setupTestRunner,
  prettyPrint,
  breaking
}
