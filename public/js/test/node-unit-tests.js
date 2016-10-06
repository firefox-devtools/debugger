"use strict"; // eslint-disable-line
const glob = require("glob").sync;
const path = require("path");
const Mocha = require("mocha");
const minimist = require("minimist");
const mock = require("mock-require");
const getConfig = require("../../../config/config").getConfig;
const setConfig = require("../../../config/feature").setConfig;

require("amd-loader");
require("babel-register");

const args = minimist(process.argv.slice(2), {
  boolean: "ci"
});
const isCI = args.ci;

setConfig(getConfig());
getConfig().baseWorkerURL = path.join(__dirname, "../../build/");

const webpack = require("webpack");
const webpackConfig = require("../../../webpack.config");
delete webpackConfig.entry.bundle;

// The source map worker is compiled with webpack (and mock-require
// doesn't work in workers) so mock it with an alias, and tweak a few
// things to make the stub fetcher work in node.
webpackConfig.resolve.alias.networkRequest =
  path.join(__dirname, "utils/stubNetworkRequest.js");
webpackConfig.externals = [{ fs: "commonjs fs" }];
webpackConfig.node = { __dirname: false };

global.Worker = require("workerjs");

// Mock various functions. This allows tests to load files from a
// local directory easily.
mock("../utils/networkRequest", require("./utils/stubNetworkRequest"));

// disable unecessary require calls
require.extensions[".css"] = () => {};
require.extensions[".svg"] = () => {};

let testFiles;
if (args._.length) {
  testFiles = args._.reduce((paths, p) => paths.concat(glob(p)), []);
} else {
  testFiles = glob("public/js/**/tests/*.js")
    .concat(glob("config/tests/*.js"));
}

const mocha = new Mocha();

if (isCI) {
  mocha.reporter("mocha-circleci-reporter");
}

testFiles.forEach(file => mocha.addFile(file));

webpack(webpackConfig).run(function(_, stats) {
  if (stats.compilation.errors.length) {
    stats.compilation.errors.forEach(err => {
      console.log(err.message);
    });
    return;
  }

  mocha.run(function(failures) {
    process.exit(failures);
  });
});
