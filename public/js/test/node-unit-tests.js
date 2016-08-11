"use strict"; // eslint-disable-line
const glob = require("glob").sync;
const path = require("path");
const fs = require("fs");
const Mocha = require("mocha");
const minimist = require("minimist");
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

global.Worker = require("workerjs");

// Mock various functions. This allows tests to load files from a
// local directory easily.
require("../utils/networkRequest").networkRequest = function(url) {
  return new Promise((resolve, reject) => {
    // example.com is used at a dummy URL that points to our local
    // `/public/js` folder.
    url = url.replace("http://example.com/test/", "/unit-sources/");
    resolve(JSON.parse(fs.readFileSync(__dirname + url, "utf8")));
  });
};

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

webpack(webpackConfig).run(function(err, stats) {
  mocha.run(function(failures) {
    process.exit(failures);
  });
});
