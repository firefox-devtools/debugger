#!/usr/bin/env node
"use strict";

const path = require("path");
const webpack = require("webpack");
const express = require("express");
const projectConfig = require("../webpack.config");
const webpackDevMiddleware = require("webpack-dev-middleware");

require("ff-devtools-libs/bin/firefox-proxy");

const config = Object.assign({}, projectConfig, {
  entry: path.join(__dirname, "../public/js/main.js"),
});

const app = express();
const compiler = webpack(config);

app.use(express.static("public"));

app.use(webpackDevMiddleware(compiler, {
  publicPath: "/public/build",
  noInfo: true,
  stats: {
    colors: true
  }
}));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "../index.html"));
});

app.listen(8000, "localhost", function(err, result) {
  if (err) {
    console.log(err);
  }

  console.log("Development Server Listening at http://localhost:8000");
});
