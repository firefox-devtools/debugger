"use strict";

require("babel-register");

const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const features = require("./config/feature");
const isDevelopment = features.isDevelopment;
const isEnabled = features.isEnabled;

let config = {
  entry: ["./public/js/main.js"],
  devtool: "source-map",
  output: {
    path: path.join(__dirname, "public/build"),
    filename: "bundle.js",
    publicPath: "/public/build"
  },
  resolve: {
    alias: {
      "devtools/client/shared/vendor/react": "react",
      "devtools": path.join(__dirname, "./public/js/lib/devtools"),
      "devtools-sham": path.join(__dirname, "./public/js/lib/devtools-sham"),
      "sdk": path.join(__dirname, "./public/js/lib/devtools-sham/sdk")
    }
  },
  module: {
    loaders: [
      { test: /\.json$/,
        loader: "json" }
    ]
  },
  plugins: []
};

if (isDevelopment()) {
  config.module.loaders.push({
    test: /\.css$/,
    loader: "style!css"
  });

  if (isEnabled("hotReloading")) {
    config.entry.push("webpack-hot-middleware/client");

    config.plugins = config.plugins.concat([
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ]);

    config.module.loaders.push({
      test: /\.js$/,
      include: path.join(__dirname, "./public/js"),
      loader: "react-hot"
    });
  }

} else {
  // Extract CSS into a single file
  config.module.loaders.push({
    test: /\.css$/,
    loader: ExtractTextPlugin.extract("style-loader", "css-loader")
  });

  config.plugins.push(new ExtractTextPlugin("styles.css"));
}

// NOTE: This is only needed to fix a bug with chrome devtools' debugger and
// destructuring params https://github.com/jlongster/debugger.html/issues/67
if (isEnabled("transformParameters")) {
  config.module.loaders.push({
    test: /\.js$/,
    exclude: /(node_modules|bower_components)/,
    loader: "babel",
    query: {
      plugins: ["transform-es2015-parameters"]
    }
  });
}

module.exports = config;
