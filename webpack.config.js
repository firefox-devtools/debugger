const buildToolboxConfig =
      require("./packages/devtools-local-toolbox/webpack.config.js");

const path = require("path");
const projectPath = path.join(__dirname, "src");

let webpackConfig = {
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
  }
};

webpackConfig = buildToolboxConfig(webpackConfig);

module.exports = webpackConfig;
