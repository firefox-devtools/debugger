"use strict"; // eslint-disable-line

require("amd-loader");
require("babel-register");

const glob = require("glob").sync;
const path = require("path");
const Mocha = require("mocha");
const minimist = require("minimist");

const { registerConfig } = require("../../../packages/devtools-config/registerConfig");
const { getConfig } = require("devtools-config");

const packagesPath = path.join(__dirname, "../../../packages");

registerConfig();
getConfig().baseWorkerURL = path.join(__dirname, "../../build/");

const args = minimist(process.argv.slice(2),
{ boolean: ["ci", "dots"] });

const mock = require("mock-require");

const isCI = args.ci;
const useDots = args.dots;

const webpack = require("webpack");
const webpackConfig = require("../../../packages/devtools-local-toolbox/webpack.config");
delete webpackConfig.entry.bundle;

// The source map worker is compiled with webpack (and mock-require
// doesn't work in workers) so mock it with an alias, and tweak a few
// things to make the stub fetcher work in node.
webpackConfig.resolve.alias["devtools-network-request"] =
  path.resolve(packagesPath, "devtools-network-request/stubNetworkRequest.js");

webpackConfig.externals = [{ fs: "commonjs fs" }];
webpackConfig.node = { __dirname: false };

global.Worker = require("workerjs");

// Mock various functions. This allows tests to load files from a
// local directory easily.
mock("devtools-network-request", require("../../../packages/devtools-network-request/stubNetworkRequest"));

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
} else if (useDots) {
  mocha.reporter("dot");
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
