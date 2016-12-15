const toolbox = require("./node_modules/devtools-local-toolbox/index");
const getConfig = require("./bin/getConfig");

const path = require("path");
const projectPath = path.join(__dirname, "src");

function buildConfig(envConfig) {
  const webpackConfig = {
    entry: {
      bundle: [path.join(projectPath, "main.js")],
      "source-map-worker": path.join(projectPath, "utils/source-map-worker.js"),
      "pretty-print-worker":
              path.join(projectPath, "utils/pretty-print-worker.js")
    },

    output: {
      path: path.join(__dirname, "assets/build"),
      filename: "[name].js",
      publicPath: "/assets/build"
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
