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
const _ = require("lodash");

// Setup Config
const getConfig = require("../config/config").getConfig;
const features = require("../config/feature")
const config = getConfig();
features.setConfig(config);

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
const webpackConfig = require("../webpack.config");
const compiler = webpack(webpackConfig);

app.use(webpackDevMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath,
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
  const tpl = fs.readFileSync(path.join(__dirname, "../index.html"));
  const html = _.template(tpl)({
    debuggerConfig: JSON.stringify(getConfig())
  });
  res.send(html);
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
