#!/usr/bin/env node
"use strict";

const path = require("path");
const webpack = require("webpack");
const express = require("express");
const projectConfig = require("../webpack.config");
const webpackDevMiddleware = require("webpack-dev-middleware");
const fs = require("fs");

function recursiveReaddirSync(dir) {
  let list = [];
  const files = fs.readdirSync(dir);

  files.forEach(function(file) {
    const stats = fs.lstatSync(path.join(dir, file));
    if (stats.isDirectory()) {
      list = list.concat(recursiveReaddirSync(path.join(dir, file)));
    } else {
      list.push(path.join(dir, file));
    }
  });

  return list;
}

function getTestPaths(dir) {
  const paths = recursiveReaddirSync(dir);

  return paths.filter(p => {
    const inTestDirectory = path.dirname(p).includes("tests");
    const inIntegrationDir = path.dirname(p).includes("integration");
    const aHiddenFile = path.basename(p).charAt(0) == ".";
    return inTestDirectory && !aHiddenFile && !inIntegrationDir;
  });
}

const testPaths = getTestPaths(path.join(__dirname, "../public/js"));

const config = Object.assign({}, projectConfig, {
  entry: testPaths.concat(path.join(__dirname, "../public/js/main.js"))
});

const app = express();
const compiler = webpack(config);

app.use(express.static("public"));
app.use(express.static("node_modules"));

app.use(webpackDevMiddleware(compiler, {
  publicPath: "/public/build",
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
