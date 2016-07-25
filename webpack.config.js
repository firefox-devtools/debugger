"use strict";

require("babel-register");

const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const features = require("./config/feature");
const isDevelopment = features.isDevelopment;
const isEnabled = features.isEnabled;
const getConfig = require("./config/config").getConfig;

const NODE_ENV = process.env.NODE_ENV || "development";

const defaultBabelPlugins = [
  "transform-flow-strip-types",
  "transform-async-to-generator"
];

let webpackConfig = {
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
        loader: "json" },
      { test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loaders: [
          "babel?" +
            defaultBabelPlugins.map(p => "plugins[]=" + p) +
            "&ignore=public/js/lib"
        ],
        isJavaScriptLoader: true
      },
      { test: /\.svg$/,
        loader: "svg-inline" }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(NODE_ENV),
      },
      "DebuggerTarget": JSON.stringify("local"),
      "DebuggerConfig": JSON.stringify(getConfig())
    })
  ]
};

if (isDevelopment()) {
  webpackConfig.module.loaders.push({
    test: /\.css$/,
    loader: "style!css"
  });

  if (isEnabled("hotReloading")) {
    webpackConfig.entry.push("webpack-hot-middleware/client");

    webpackConfig.plugins = webpackConfig.plugins.concat([
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ]);

    webpackConfig.module.loaders.forEach(spec => {
      if (spec.isJavaScriptLoader) {
        spec.loaders.unshift("react-hot");
      }
    });
  }
} else {
  // Extract CSS into a single file
  webpackConfig.module.loaders.push({
    test: /\.css$/,
    loader: ExtractTextPlugin.extract("style-loader", "css-loader")
  });

  webpackConfig.plugins.push(new ExtractTextPlugin("styles.css"));
}

// NOTE: This is only needed to fix a bug with chrome devtools' debugger and
// destructuring params https://github.com/jlongster/debugger.html/issues/67
if (isEnabled("transformParameters")) {
  webpackConfig.module.loaders.forEach(spec => {
    if (spec.isJavaScriptLoader) {
      const idx = spec.loaders.findIndex(loader => loader.includes("babel"));
      spec.loaders[idx] += "&plugins[]=transform-es2015-parameters";
    }
  });
}

module.exports = webpackConfig;
