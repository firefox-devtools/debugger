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
const serveIndex = require("serve-index");
const checkNode = require("check-node-version");

checkNode(">=5.0.0", function(_, opts) {
  if (!opts.nodeSatisfied) {
    const version = opts.node.raw;
    console.log(`Sorry, Your version of node is ${version}.`);
    console.log("The minimum requirement is >=5.0.0");
    exit();
  }
});

const { getValue, isDevelopment } = require("devtools-config");
const {registerConfig} = require("../../devtools-config/registerConfig");
registerConfig();


if (!getValue("firefox.webSocketConnection")) {
  const firefoxProxy = require("./firefox-proxy");
  firefoxProxy({ logging: getValue("logging.firefoxProxy") });
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

if (getValue("hotReloading")) {
  app.use(webpackHotMiddleware(compiler));
} else {
  console.log("Hot Reloading can be enabled by adding " +
  "\"hotReloading\": true to your local.json config");
}

// Static middleware
app.use(express.static("public"));

// Routes
app.get("/", function(req, res) {
  const tplPath = path.join(__dirname, "../index.html");
  const tplFile = fs.readFileSync(tplPath, "utf8");
  res.send(Mustache.render(tplFile, { isDevelopment: isDevelopment() }));
});

app.get("/get", function(req, res) {
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
});

// Listen'
const serverPort = getValue("development.serverPort");
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

const examplesPort = getValue("development.examplesPort");
examples.listen(examplesPort, "0.0.0.0", function(err, result) {
  if (err) {
    console.log(err);
  } else {
    console.log(`View debugger examples at http://localhost:${examplesPort}`);
  }
});
