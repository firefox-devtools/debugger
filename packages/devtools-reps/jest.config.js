const { resolve } = require("path");
const rootDir = resolve(__dirname, "src");
module.exports = {
  rootDir,
  displayName: "devtools-reps test",
  setupFiles: [
    "<rootDir>/../../../src/test/__mocks__/request-animation-frame.js",
    "<rootDir>/test/__mocks__/selection.js",
    "<rootDir>/test/setup.js"
  ],
  setupTestFrameworkScriptFile: "<rootDir>/test/setup-file.js",
  testMatch: ["**/tests/**/*.js"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/test/",
    "<rootDir>/reps/tests/test-helpers",
    "<rootDir>/utils/tests/fixtures/",
    "<rootDir>/object-inspector/tests/__mocks__/",
    "<rootDir>/object-inspector/tests/test-utils"
  ],
  testURL: "http://localhost/",
  transformIgnorePatterns: ["node_modules/(?!devtools-)"],
  moduleNameMapper: {
    "\\.css$": "<rootDir>/../../../src/test/__mocks__/styleMock.js"
  }
};
