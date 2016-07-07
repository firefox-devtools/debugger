"use strict";

const path = require("path");
const webpack = require("webpack");

const getConfig = require("../config/config").getConfig;

module.exports = {
  resolve: {
    alias: {
      "devtools": path.join(__dirname, "./public/js/lib/devtools"),
      "devtools-sham": path.join(__dirname, "./public/js/lib/devtools-sham"),
      "sdk": path.join(__dirname, "./public/js/lib/devtools-sham/sdk")
    },
    extensions: ["", ".js", ".jsm"],
    root: path.join(__dirname, "node_modules")
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style-loader!css-loader" },
      { test: /\.json$/, loader: "json-loader" },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      "DebuggerConfig": JSON.stringify(getConfig())
    })
  ]
};
