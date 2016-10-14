const path = require("path");
const webpack = require("webpack");

const { getConfig } = require("../packages/devtools-config/registerConfig")

module.exports = {
  resolve: {
    alias: {
    },
    extensions: ["", ".js", ".jsm"],
    root: path.join(__dirname, "node_modules")
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style-loader!css-loader" },
      { test: /\.json$/, loader: "json-loader" },
      { test: /\.svg$/, loader: "svg-inline" }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      "DebuggerConfig": JSON.stringify(getConfig())
    })
  ]
};
