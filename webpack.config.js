"use strict";

require("babel-register");

const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const features = require("./config/feature");
const isDevelopment = features.isDevelopment;
const isEnabled = features.isEnabled;
const getConfig = require("./config/config").getConfig;

/*
  Build Targets:

  local development mode: `NODE_ENV=development target=local webpack`
  simulate firefox panel: `target=firefox-panel webpack`
  firefox production panel: `NODE_ENV=production target=firefox-panel webpack`
*/
const nodeEnv = process.env.NODE_ENV || "development";
const debuggerTarget = process.env.target || "local";

function getOutput() {
  let output = {
    path: path.join(__dirname, "public/build"),
    filename: "bundle.js",
    publicPath: "/public/build"
  }

  if (debuggerTarget == "firefox-panel") {
    output.library = "Debugger";
  }

  return output;
}

function getPlugins() {
  let plugins = [];

  plugins.push(new webpack.DefinePlugin({
    "process.env": {
      NODE_ENV: JSON.stringify(nodeEnv),
    },
    "DebuggerTarget": JSON.stringify(debuggerTarget),
    "DebuggerConfig": JSON.stringify(getConfig())
  }));

  if (!isDevelopment()) {
    plugins.push(new ExtractTextPlugin("styles.css"));
  }

  if (isEnabled("hotReloading")) {
    plugins = plugins.concat([
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ]);
  }

  return plugins;
}

function getEntry() {
  let entry = ["./public/js/main.js"];

  if (isEnabled("hotReloading")) {
    entry.push("webpack-hot-middleware/client");
  }

  return entry;
}

function getLoaders() {
  let loaders = [
    { test: /\.json$/,
      loader: "json" }
  ];

  if (isDevelopment()) {
    loaders.push({
      test: /\.css$/,
      loader: "style!css"
    });
  } else {
    loaders.push({
      test: /\.css$/,
      loader: ExtractTextPlugin.extract("style-loader", "css-loader")
    });
  }

  if (isEnabled("hotReloading")) {
    loaders.push({
      test: /\.js$/,
      include: path.join(__dirname, "./public/js"),
      loader: "react-hot"
    });
  }

  // NOTE: This is only needed to fix a bug with chrome devtools' debugger and
  // destructuring params https://github.com/jlongster/debugger.html/issues/67
  if (isEnabled("transformParameters")) {
    loaders.push({
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      loader: "babel",
      query: {
        plugins: ["transform-es2015-parameters"]
      }
    });
  }

  return loaders;
}

function getAlias() {
  return {
    "devtools/client/shared/vendor/react": "react",
    "devtools": path.join(__dirname, "./public/js/lib/devtools"),
    "devtools-sham": path.join(__dirname, "./public/js/lib/devtools-sham"),
    "sdk": path.join(__dirname, "./public/js/lib/devtools-sham/sdk")
  }
}

let webpackConfig = {
  entry: getEntry(),
  devtool: "source-map",
  output: getOutput(),
  resolve: {
    alias: getAlias()
  },
  module: {
    loaders: getLoaders()
  },
  plugins: getPlugins()
};

module.exports = webpackConfig;
