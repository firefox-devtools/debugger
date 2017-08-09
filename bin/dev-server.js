const fs = require("fs");
const path = require("path");

const toolbox = require("devtools-launchpad/index");
const feature = require("devtools-config");
const getConfig = require("./getConfig");
const express = require("express");

const envConfig = getConfig();
feature.setConfig(envConfig);

let webpackConfig = require("../webpack.config");

let { app } = toolbox.startDevServer(envConfig, webpackConfig, __dirname);

app.use("/integration/examples", express.static("src/test/mochitest/examples"));

console.log("View debugger examples here:");
console.log("https://github.com/devtools-html/debugger-examples");
