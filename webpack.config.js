/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

const toolbox = require("./node_modules/devtools-launchpad/index");

const getConfig = require("./bin/getConfig");
const mozillaCentralMappings = require("./configs/mozilla-central-mappings");
const { NormalModuleReplacementPlugin } = require("webpack");
const path = require("path");
var Visualizer = require("webpack-visualizer-plugin");
const ObjectRestSpreadPlugin = require("@sucrase/webpack-object-rest-spread-plugin");

const isProduction = process.env.NODE_ENV === "production";

/*
 * builds a path that's relative to the project path
 * returns an array so that we can prepend
 * hot-module-reloading in local development
 */
function getEntry(filename) {
  return [path.join(__dirname, filename)];
}

const webpackConfig = {
  entry: {
    // We always generate the debugger bundle, but we will only copy the CSS
    // artifact over to mozilla-central.
    debugger: getEntry("src/main.js"),
    "editor.worker": "monaco-editor/esm/vs/editor/editor.worker.js",
    "parser-worker": getEntry("src/workers/parser/worker.js"),
    "pretty-print-worker": getEntry("src/workers/pretty-print/worker.js"),
    "search-worker": getEntry("src/workers/search/worker.js"),
    "source-map-worker": getEntry("packages/devtools-source-map/src/worker.js"),
    "source-map-index": getEntry("packages/devtools-source-map/src/index.js")
  },

  output: {
    path: path.join(__dirname, "assets/build"),
    filename: "[name].js",
    publicPath: "/assets/build"
  }
};

if (isProduction) {
  // In the firefox panel, build the vendored dependencies as a bundle instead,
  // the other debugger modules will be transpiled to a format that is
  // compatible with the DevTools Loader.
  webpackConfig.entry.vendors = getEntry("src/vendors.js");
  webpackConfig.entry.reps = getEntry("packages/devtools-reps/src/index.js");
}

function buildConfig(envConfig) {
  const extra = {
    babelIncludes: ["react-aria-components"]
  };

  webpackConfig.plugins = [new ObjectRestSpreadPlugin()];

  if (!isProduction) {
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

    extra.excludeMap = mozillaCentralMappings;

    mappings.forEach(([regex, res]) => {
      webpackConfig.plugins.push(new NormalModuleReplacementPlugin(regex, res));
    });
  }

  return toolbox.toolboxConfig(webpackConfig, envConfig, extra);
}

const envConfig = getConfig();

module.exports = buildConfig(envConfig);
