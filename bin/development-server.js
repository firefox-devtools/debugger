#!/usr/bin/env node
"use strict";

require("babel-register");

const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const express = require("express");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const http = require("http");

// Improve the first run experience: copy the local sample config to a
// local file so webpack can find it. We don't have to do this, but
// otherwise webpack prints a warning that scares people.
const localConfigPath = path.join(__dirname, "../config/local.json")
if(!fs.existsSync(localConfigPath)) {
  const defaultConfig = fs.readFileSync(
    path.join(__dirname, "../config/local.sample.json")
  );
  fs.writeFileSync(localConfigPath, defaultConfig);
}

const features = require("../config/feature");

require("./firefox-proxy");

function httpGet(url, onResponse) {
  return http.get(url, (response) => {
    let body = '';
    response.on('data', function(d) {
      body += d;
    });
    response.on('end', function() {
      onResponse(body);
    });
  });
}

const app = express();

// Webpack middleware

const config = require("../webpack.config");
const compiler = webpack(config);

app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
  noInfo: true,
  stats: { colors: true }
}));

if(features.isEnabled("hotReloading")) {
  app.use(webpackHotMiddleware(compiler));
}

// Static middleware

app.use(express.static("public/js/test/examples"));
app.use(express.static("public"));

// Routes

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "../index.html"));
});

app.get("/chrome-tabs", function(req, res) {
  if(features.isEnabled("chrome.debug")) {
    const webSocketPort = features.getValue("chrome.webSocketPort");
    const url = `http://localhost:${webSocketPort}/json/list`;

    const tabRequest = httpGet(url, body => res.json(JSON.parse(body)));

    tabRequest.on('error', function (err) {
      if (err.code == "ECONNREFUSED") {
        console.log("Failed to connect to chrome");
      }
    });
  }
  else {
    res.json([]);
  }
})

// Listen

app.listen(8000, "localhost", function(err, result) {
  if (err) {
    console.log(err);
  }

  console.log("Development Server Listening at http://localhost:8000");
});
