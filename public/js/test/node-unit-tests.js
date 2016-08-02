const glob = require("glob").sync;
const path = require("path");
const Mocha = require("mocha");
const getConfig = require("../../../config/config").getConfig;
const setConfig = require("../../../config/feature").setConfig;

require("amd-loader");
require("babel-register");

setConfig(getConfig());

const webpack = require("webpack");
const webpackConfig = require("../../../webpack.config");
delete webpackConfig.entry.bundle;

const Worker = require("workerjs");
global.Worker = function(_path) {
  const workerPath = path.join(__dirname, "../../../" + _path);
  return new Worker(workerPath);
};

// disable css requires
require.extensions[".css"] = function() {
  return {};
};

const testFiles = glob("public/js/**/tests/*.js")
                  .concat(glob("config/tests/*.js"));

const mocha = new Mocha();
testFiles.forEach(file => mocha.addFile(file));

webpack(webpackConfig).run(function(err, stats) {
  mocha.run(function(failures) {
    process.exit(failures);
  });
});
