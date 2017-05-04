const toolbox = require("./node_modules/devtools-launchpad/index");
const getConfig = require("./bin/getConfig");
const { isDevelopment, isFirefoxPanel } = require("devtools-config");
const { NormalModuleReplacementPlugin } = require("webpack");
const path = require("path");
const projectPath = path.join(__dirname, "src");

/*
 * builds a path that's relative to the project path
 * returns an array so that we can prepend
 * hot-module-reloading in local development
 */
function getEntry(filename) {
  return [path.join(projectPath, filename)];
}

let webpackConfig = {
  entry: {
    debugger: getEntry("main.js"),
    "parser-worker": getEntry("utils/parser/worker.js"),
    "pretty-print-worker": getEntry("utils/pretty-print/worker.js"),
    "integration-tests": getEntry("test/integration/tests.js")
  },

  output: {
    path: path.join(__dirname, "assets/build"),
    filename: "[name].js",
    publicPath: "/assets/build",
    libraryTarget: "umd"
  },

  resolve: {
    alias: {
      "react-dom": "react-dom/dist/react-dom"
    }
  },

  module: {
    // Ignore the prebuilt mocha lib file.
    noParse: /mocha\/mocha\.js/i
  }
};

function buildConfig(envConfig) {
  if (!isDevelopment()) {
    webpackConfig.output.libraryTarget = "umd";
    webpackConfig.plugins = [];

    const mappings = [
      [/\.\/mocha/, "./mochitest"],
      [/\.\.\/utils\/mocha/, "../utils/mochitest"],
      [/\.\/utils\/mocha/, "./utils/mochitest"]
    ];

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

  return toolbox.toolboxConfig(webpackConfig, envConfig);
}

const envConfig = getConfig();

module.exports = buildConfig(envConfig);
