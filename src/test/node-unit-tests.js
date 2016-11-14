"use strict"; // eslint-disable-line

require("amd-loader");
require("babel-register");
const mock = require("mock-require");

const glob = require("glob").sync;
const path = require("path");
const Mocha = require("mocha");
const minimist = require("minimist");

const getConfig = require("../../packages/devtools-config/src/config").getConfig;
const setConfig = require("devtools-config").setConfig;

// Mock various functions. This allows tests to load files from a
// local directory easily.
mock("devtools-network-request", require("../../packages/devtools-network-request/stubNetworkRequest"));
mock("../utils/prefs", { prefs: { clientSourceMapsEnabled: true }});

const baseWorkerURL = path.join(__dirname, "../../assets/build/");
const packagesPath = path.join(__dirname, "../../packages");

setConfig(Object.assign({}, getConfig(), { baseWorkerURL }));

const args = minimist(process.argv.slice(2),
{ boolean: ["ci", "dots"] });

const isCI = args.ci;
const useDots = args.dots;

const webpack = require("webpack");
const webpackConfig = require("../../webpack.config");
delete webpackConfig.entry.bundle;

// The source map worker is compiled with webpack (and mock-require
// doesn't work in workers) so mock it with an alias, and tweak a few
// things to make the stub fetcher work in node.
webpackConfig.resolve.alias["devtools-network-request"] =
  path.resolve(packagesPath, "devtools-network-request/stubNetworkRequest.js");

webpackConfig.externals = [{ fs: "commonjs fs" }];
webpackConfig.node = { __dirname: false };

global.Worker = require("workerjs");

// disable unecessary require calls
require.extensions[".css"] = () => {};
require.extensions[".svg"] = () => {};

let testFiles;
if (args._.length) {
  testFiles = args._.reduce((paths, p) => paths.concat(glob(p)), []);
} else {
  testFiles = glob("src/actions/tests/*.js")
    .concat(glob("src/reducers/tests/*.js"))
    .concat(glob("src/utils/tests/*.js"))
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
