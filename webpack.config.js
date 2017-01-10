const toolbox = require("./node_modules/devtools-launchpad/index");
const getConfig = require("./bin/getConfig");

const path = require("path");
const projectPath = path.join(__dirname, "src");

function buildConfig(envConfig) {
  const webpackConfig = {
    entry: {
      debugger: [path.join(projectPath, "main.js")],
      "source-map-worker": path.join(projectPath, "utils/source-map-worker.js"),
      "pretty-print-worker":
              path.join(projectPath, "utils/pretty-print-worker.js"),
      "integration-tests": path.join(projectPath, "test/integration/tests.js"),
    },

    output: {
      path: path.join(__dirname, "assets/build"),
      filename: "[name].js",
      publicPath: "/assets/build",
      library: "Debugger"
    },

    resolve: {
      alias: {
        "devtools/client/shared/vendor/react": "react",
        "devtools/client/shared/vendor/react-dom": "react-dom",
      }
    }
  }

  return toolbox.toolboxConfig(webpackConfig, envConfig);
}

const envConfig = getConfig();

module.exports = buildConfig(envConfig);
