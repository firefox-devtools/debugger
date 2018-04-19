/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

const toolbox = require("./node_modules/devtools-launchpad/index");

const getConfig = require("./bin/getConfig");
const { isDevelopment, isFirefoxPanel } = require("devtools-config");
const { NormalModuleReplacementPlugin } = require("webpack");
const path = require("path");
const projectPath = path.join(__dirname, "src");
var Visualizer = require("webpack-visualizer-plugin");
const ObjectRestSpreadPlugin = require("@sucrase/webpack-object-rest-spread-plugin");

/*
 * builds a path that's relative to the project path
 * returns an array so that we can prepend
 * hot-module-reloading in local development
 */
function getEntry(filename) {
  return [path.join(projectPath, filename)];
}

const webpackConfig = {
  entry: {
    debugger: getEntry("main.js"),
    "parser-worker": getEntry("workers/parser/worker.js"),
    "pretty-print-worker": getEntry("workers/pretty-print/worker.js"),
    "search-worker": getEntry("workers/search/worker.js")
  },

  output: {
    path: path.join(__dirname, "assets/build"),
    filename: "[name].js",
    publicPath: "/assets/build"
  }
};

function buildConfig(envConfig) {
  const extra = {};
  webpackConfig.plugins = [new ObjectRestSpreadPlugin()];
  if (isDevelopment()) {
    webpackConfig.module = webpackConfig.module || {};
    webpackConfig.module.rules = webpackConfig.module.rules || [];
  } else {
    webpackConfig.output.libraryTarget = "umd";

    if (process.env.vis) {
      const viz = new Visualizer({
        filename: "webpack-stats.html"
      });
      webpackConfig.plugins.push(viz);
    }

    const mappings = [
      [/\.\/mocha/, "./mochitest"],
      [/\.\.\/utils\/mocha/, "../utils/mochitest"],
      [/\.\/utils\/mocha/, "./utils/mochitest"],
      [/\.\/percy-stub/, "./percy-webpack"]
    ];

    extra.excludeMap = {
      "./source-editor": "devtools/client/sourceeditor/editor",
      "../editor/source-editor": "devtools/client/sourceeditor/editor",
      "./test-flag": "devtools/shared/flags",
      "./fronts-device": "devtools/shared/fronts/device",
      react: "devtools/client/shared/vendor/react",
      redux: "devtools/client/shared/vendor/redux",
      "react-dom": "devtools/client/shared/vendor/react-dom",
      lodash: "devtools/client/shared/vendor/lodash",
      immutable: "devtools/client/shared/vendor/immutable",
      "react-redux": "devtools/client/shared/vendor/react-redux",

      "wasmparser/dist/WasmParser": "devtools/client/shared/vendor/WasmParser",
      "wasmparser/dist/WasmDis": "devtools/client/shared/vendor/WasmDis",

      // The excluded files below should not be required while the Debugger runs
      // in Firefox. Here, "devtools/shared/flags" is used as a dummy module.
      "../assets/panel/debugger.properties": "devtools/shared/flags",
      "devtools-connection": "devtools/shared/flags",
      "chrome-remote-interface": "devtools/shared/flags",
      "devtools-launchpad": "devtools/shared/flags"
    };

    mappings.forEach(([regex, res]) => {
      webpackConfig.plugins.push(new NormalModuleReplacementPlugin(regex, res));
    });
  }

  // TODO: It would be nice to stop bundling `devtools-source-map` entirely for
  // the Firefox panel, but at the moment we still use `isOriginalId` from a
  // required copy of the module, instead of using the one from the toolbox.
  if (!isFirefoxPanel()) {
    // When used as a Firefox panel, the toolbox supplies its own source map
    // service and worker, so we only need to build this when running in a tab.
    webpackConfig.entry["source-map-worker"] = getEntry(
      "../node_modules/devtools-source-map/src/worker.js"
    );
  }

  return toolbox.toolboxConfig(webpackConfig, envConfig, extra);
}

const envConfig = getConfig();

module.exports = buildConfig(envConfig);
