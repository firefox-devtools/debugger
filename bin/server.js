#!/usr/bin/env node
"use strict";

const path = require("path");
const webpack = require("webpack");
const express = require("express");
const projectConfig = require("../webpack.config");
const webpackDevMiddleware = require("webpack-dev-middleware");

const config = Object.assign({}, projectConfig, {
  entry: path.join(__dirname, "../public/js/main.js"),
});

const babeledConfig = Object.assign({}, config);
babeledConfig.module.loaders.push({
  test: /\.js$/,
  exclude: /(node_modules|bower_components)/,
  loader: "babel",
  query: {
    presets: ['react', 'es2015', 'stage-0'],
    plugins: ['transform-runtime']
  },
});

const app = express();
const compiler = webpack(config);
const babeledCompiler = webpack(config);

app.use(express.static("public"));

app.use(webpackDevMiddleware(compiler, {
  publicPath: "/public/build",
  noInfo: true,
  stats: {
    colors: true
  }
}));

app.use(webpackDevMiddleware(babeledCompiler, {
  publicPath: "/babeled",
  path: "foo",
  noInfo: true,
  stats: {
    colors: true
  }
}));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "../index.html"));
});

app.get("/babeled", function(req, res) {
  res.sendFile(path.join(__dirname, "../babeled/index.html"));
});

app.listen(8000, "localhost", function(err, result) {
  if (err) {
    console.log(err);
  }

  console.log("Listening at http://localhost:8000");
});
