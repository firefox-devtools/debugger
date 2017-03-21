const toolbox = require("./node_modules/devtools-launchpad/index");
const getConfig = require("./bin/getConfig");
const { isDevelopment } = require("devtools-config");
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
  // TODO: Could probably set context here and use less full paths?
  entry: {
    debugger: getEntry("main.js"),
    "source-map-worker": getEntry(
      "../node_modules/devtools-source-map/src/worker.js",
    ),
    "parser-worker": getEntry("utils/parser/worker.js"),
    "pretty-print-worker": getEntry("utils/pretty-print-worker.js"),
    "integration-tests": getEntry("test/integration/tests.js"),
  },

  output: {
    path: path.join(__dirname, "assets/build"),
    filename: "[name].js",
    publicPath: "/assets/build",
    libraryTarget: "umd",
  },

  resolve: {
    alias: {
      "react-dom": "react-dom/dist/react-dom",
    },
  },
};

function buildConfig(envConfig) {
  if (!isDevelopment()) {
    webpackConfig.output.libraryTarget = "umd";
    webpackConfig.plugins = [];

    const mappings = [
      [/\.\/mocha/, "./mochitest"],
      [/\.\.\/utils\/mocha/, "../utils/mochitest"],
      [/\.\/utils\/mocha/, "./utils/mochitest"],
    ];

    mappings.forEach(([regex, res]) => {
      webpackConfig.plugins.push(new NormalModuleReplacementPlugin(regex, res));
    });
  }

  return toolbox.toolboxConfig(webpackConfig, envConfig);
}

const envConfig = getConfig();

module.exports = buildConfig(envConfig);
