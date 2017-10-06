const fs = require("fs");
const path = require("path");

const toolbox = require("devtools-launchpad/index");
const feature = require("devtools-config");
const getConfig = require("./getConfig");
const express = require("express");
const serve = require("express-static");

const envConfig = getConfig();
feature.setConfig(envConfig);

let webpackConfig = require("../webpack.config");

let { app } = toolbox.startDevServer(envConfig, webpackConfig, __dirname);

app.use("/integration/examples", express.static("src/test/mochitest/examples"));

app.use("/dbg", serve(path.join(__dirname, "../assets/images")));

console.log("View debugger examples here:");
console.log("https://github.com/devtools-html/debugger-examples");
