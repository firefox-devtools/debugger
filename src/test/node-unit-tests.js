require("amd-loader");
require("babel-register");
const mock = require("mock-require");


const glob = require("glob").sync;
const path = require("path");
const Mocha = require("mocha");
const minimist = require("minimist");

const getConfig = require("../../bin/getConfig");
const setConfig = require("devtools-config").setConfig;

// Mock various functions. This allows tests to load files from a
// local directory easily.
mock("devtools-modules", { Services: { appinfo: { OS: "darwin" }}});
mock("../utils/editor/source-editor", {});

mock("../utils/prefs", {
  prefs: {
    clientSourceMapsEnabled: true,
    startPanelCollapsed: false,
    endPanelCollapsed: false
  }
});

const baseWorkerURL = path.join(__dirname, "../../assets/build/");

const envConfig = getConfig();
setConfig(Object.assign({}, envConfig, { baseWorkerURL }));

const args = minimist(process.argv.slice(2),
{ boolean: ["ci", "dots"] });

const isCI = args.ci;
const useDots = args.dots;

const webpack = require("webpack");
const webpackConfig = require("../../webpack.config");
delete webpackConfig.entry.bundle;

webpackConfig.externals = [{
  fs: "commonjs fs",
}];

webpackConfig.resolve.alias["devtools-network-request"] =
  "devtools-network-request/stubNetworkRequest";

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

// flip this if you want (dangerous), but faster runs
if (true) {
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
} else {
  mocha.run(function(failures) {
    process.exit(failures);
  });
}
