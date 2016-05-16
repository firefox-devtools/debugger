#!/usr/bin/env node
"use strict";

const path = require("path");
const webpack = require("webpack");
const express = require("express");
const projectConfig = require("../webpack.config");
const webpackDevMiddleware = require("webpack-dev-middleware");
const open = require("openurl").open;

require("ff-devtools-libs/bin/firefox-proxy");

const config = Object.assign({}, projectConfig, {
  entry: path.join(__dirname, "../public/js/main.js"),
});

const babelConfig = Object.assign({}, config);
babelConfig.module.loaders.push({
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
const babelCompiler = webpack(babelConfig);

app.use(express.static("public"));

app.use(webpackDevMiddleware(compiler, {
  publicPath: "/public/build",
  noInfo: true,
  stats: {
    colors: true
  }
}));

app.use(webpackDevMiddleware(babelCompiler, {
  publicPath: "/babel",
  noInfo: true,
  stats: {
    colors: true
  }
}));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "../index.html"));
});

app.get("/babel", function(req, res) {
  res.sendFile(path.join(__dirname, "../babel.html"));
});

app.listen(8000, "localhost", function(err, result) {
  if (err) {
    console.log(err);
  }

  console.log("Development Server Listening at http://localhost:8000");
});

open("http://localhost:8000")
