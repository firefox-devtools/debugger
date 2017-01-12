#!/usr/bin/env node
"use strict";

const path = require("path");
const webpack = require("webpack");
const express = require("express");
const webpackDevMiddleware = require("webpack-dev-middleware");
const fs = require("fs");
var serveStatic = require('serve-static')

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

const testPaths = getTestPaths(path.join(__dirname, "../src"));

function mochaWebpackConfig(projectConfig) {
  projectConfig.entry["debugger-unit-tests"] =
    projectConfig.entry.debugger.concat(testPaths);

  return projectConfig;
}

function startMochaServer(app) {
  app.use("/examples", express.static("src/test/mochitest/examples"));

  app.use(express.static("node_modules"));

  app.get("/mocha", function(req, res) {
    res.sendFile(path.join(__dirname, "../mocha-runner.html"));
  });

}

module.exports = {mochaWebpackConfig, startMochaServer};
