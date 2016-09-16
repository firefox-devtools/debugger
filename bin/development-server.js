#!/usr/bin/env node

"use strict";

require("babel-register");

const path = require("path");
const webpack = require("webpack");
const express = require("express");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const http = require("http");
const serveIndex = require("serve-index");

// Setup Config
const getConfig = require("../config/config").getConfig;
const feature = require("../config/feature");
const config = getConfig();

feature.setConfig(config);

if (!feature.getValue("firefox.webSocketConnection")) {
  const firefoxProxy = require("./firefox-proxy");
  firefoxProxy({ logging: feature.getValue("logging.firefoxProxy") });
}

function httpGet(url, onResponse) {
  return http.get(url, (response) => {
    if (response.statusCode !== 200) {
      console.error(`error response: ${response.statusCode} to ${url}`);
      response.emit("statusCode", new Error(response.statusCode));
      return onResponse("{}");
    }
    let body = "";
    response.on("data", function(d) {
      body += d;
    });
    response.on("end", () => onResponse(body));
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

if (feature.getValue("hotReloading")) {
  app.use(webpackHotMiddleware(compiler));
} else {
  console.log("Hot Reloading can be enabled by adding " +
  "\"hotReloading\": true to your local.json config");
}

// Static middleware
app.use(express.static("public"));

// Routes
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "../index.html"));
});

app.get("/get", function(req, res) {
  const httpReq = httpGet(
    req.query.url,
    body => {
      try {
        return res.json(JSON.parse(body));
      } catch (e) {
        throw Error(e);
      }
    }
  );

  httpReq.on("error", err => res.status(500).send(err.code));
  httpReq.on("statusCode", err => res.status(err.message).send(err.message));
});

// Listen'
const serverPort = feature.getValue("development.serverPort");
app.listen(serverPort, "0.0.0.0", function(err, result) {
  if (err) {
    console.log(err);
  } else {
    console.log(`Development Server Listening at http://localhost:${serverPort}`);
  }
});

const examples = express();
examples.use(express.static("public/js/test/examples"));
examples.use(serveIndex("public/js/test/examples", { icons: true }));

const examplesPort = feature.getValue("development.examplesPort");
examples.listen(examplesPort, "0.0.0.0", function(err, result) {
  if (err) {
    console.log(err);
  } else {
    console.log(`View debugger examples at http://localhost:${examplesPort}`);
  }
});
