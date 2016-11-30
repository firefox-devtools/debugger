#!/usr/bin/env node

"use strict";

require("babel-register");

const path = require("path");
const fs = require("fs");
const Mustache = require("mustache");
const webpack = require("webpack");
const express = require("express");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const http = require("http");
const checkNode = require("check-node-version");
const getValue = require("devtools-config").getValue;
const setConfig = require("devtools-config").setConfig;
const isDevelopment = require("devtools-config").isDevelopment;

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

function serveRoot(req, res) {
  const tplPath = path.join(__dirname, "../index.html");
  const tplFile = fs.readFileSync(tplPath, "utf8");
  res.send(Mustache.render(tplFile, { isDevelopment: isDevelopment() }));
}

function handleNetworkRequest(req, res) {
  const url = req.query.url;
  if (url.indexOf("file://") === 0) {
    const path = url.replace("file://", "");
    res.json(JSON.parse(fs.readFileSync(path, "utf8")));
  }
  else {
    const httpReq = httpGet(
      req.query.url,
      body => {
        try {
          res.send(body);
        } catch (e) {
          res.status(500).send("Malformed json");
        }
      }
    );

    httpReq.on("error", err => res.status(500).send(err.code));
    httpReq.on("statusCode", err => res.status(err.message).send(err.message));
  }
}

function onRequest(err, result) {
  const serverPort = getValue("development.serverPort");

  if (err) {
    console.log(err);
  } else {
    console.log(`Development Server Listening at http://localhost:${serverPort}`);
  }
}

function startDevServer(devConfig, webpackConfig) {
  setConfig(devConfig);
  checkNode(">=6.9.0", function(_, opts) {
    if (!opts.nodeSatisfied) {
      const version = opts.node.raw;
      console.log(`Sorry, Your version of node is ${version}.`);
      console.log("The minimum requirement is >=6.9.0");
      exit();
    }
  });

  if (!getValue("firefox.webSocketConnection")) {
    const firefoxProxy = require("./firefox-proxy");
    firefoxProxy({ logging: getValue("logging.firefoxProxy") });
  }

  // setup app
  const app = express();
  app.use(express.static("assets/build"));
  app.use(express.static(path.join(__dirname, '../assets')));
  if (!getValue("development.customIndex")) {
    app.get("/", serveRoot);
  }
  app.get("/get", handleNetworkRequest);
  const serverPort = getValue("development.serverPort");
  app.listen(serverPort, "0.0.0.0", onRequest);

  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    noInfo: true,
    stats: { colors: true }
  }));

  if (getValue("hotReloading")) {
    app.use(webpackHotMiddleware(compiler));
  } else {
    console.log("Hot Reloading - https://github.com/devtools-html/debugger.html/blob/master/docs/local-development.md#hot-reloading");
  }

  return { express, app }
}

module.exports = {
  startDevServer
}
