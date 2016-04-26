#!/usr/bin/env node
"use strict";

const path = require("path");
const webpack = require("webpack");
const express = require("express");
const projectConfig = require("../webpack.config");
const webpackDevMiddleware = require("webpack-dev-middleware");
const getTestPaths = require("./getTestPaths");

const testPaths = getTestPaths(path.join(__dirname, "../public/js"));

const config = Object.assign({}, projectConfig, {
  entry: testPaths.concat(path.join(__dirname, "../public/js/main.js")),
  output: {
    path: path.join(__dirname, "../build"),
    filename: "bundle.js"
  },
});

const app = express();
const compiler = webpack(config);

app.use(express.static("public"));

app.use(webpackDevMiddleware(compiler, {
  publicPath: "/build",
  noInfo: true,
  stats: {
    colors: true
  }
}));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "../mocha-runner.html"));
});

app.listen(8002, "localhost", function(err, result) {
  if (err) {
    console.log(err);
  }

  console.log("Listening at http://localhost:8002");
});
