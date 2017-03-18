const tests = require("./tests/index");

const { setupTestRunner } = require("./utils/mocha");
const utils = require("./utils");
const { isDevelopment } = require("devtools-config");

if (isDevelopment()) {
  require("./runner");
}

module.exports = Object.assign({}, tests, {
  setupTestRunner,
  utils,
});
