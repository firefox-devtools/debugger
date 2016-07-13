const glob = require("glob").sync;
const path = require("path");

require("amd-loader");

// disable css requires
require.extensions[".css"] = function() {
  return {};
};

// transform the test file from absolute path to relative path
// e.g. public/js/components/tests/Frames.js => ../components/tests/Frames.js
function testPath(testFile) {
  return path.join("..", path.relative("public/js", testFile));
}

glob("public/js/**/tests/*.js").map(testPath).map(require);
glob("config/tests/*.js").map(testPath).map(require);
