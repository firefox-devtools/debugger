#!/usr/bin/env node
"use strict";

const path = require("path");
const webpack = require("webpack");
const express = require("express");
const webpackDevMiddleware = require("webpack-dev-middleware");
const open = require("openurl").open;
const http = require("http");

const projectConfig = require("../webpack.config");
const getValue = require("../public/js/configs/feature").getValue;

require("ff-devtools-libs/bin/firefox-proxy");

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

const config = Object.assign({}, projectConfig, {
  entry: path.join(__dirname, "../public/js/main.js"),
});

const babelConfig = Object.assign({}, config);
babelConfig.module.loaders.push({
  test: /\.js$/,
  exclude: /(node_modules|bower_components)/,
  loader: "babel",
  query: {
    presets: ['react', 'es2015', 'stage-0'],
    plugins: ['transform-runtime']
  },
});

const app = express();
const compiler = webpack(config);
const babelCompiler = webpack(babelConfig);

app.use(express.static("public"));

app.use(webpackDevMiddleware(compiler, {
  publicPath: "/public/build",
  noInfo: true,
  stats: {
    colors: true
  }
}));

app.use(webpackDevMiddleware(babelCompiler, {
  publicPath: "/babel",
  noInfo: true,
  stats: {
    colors: true
  }
}));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "../index.html"));
});

app.get("/babel", function(req, res) {
  res.sendFile(path.join(__dirname, "../babel.html"));
});

app.get("/chrome-tabs", function(req, res) {
  const webSocketPort = getValue("chrome.webSocketPort");
  const url = `http://localhost:${webSocketPort}/json/list`;

  const tabRequest = httpGet(url, body => res.json(JSON.parse(body)));

  tabRequest.on('error', function (err) {
    if (err.code == "ECONNREFUSED") {
      console.log("Failed to connect to chrome");
    }
  });

})

app.listen(8000, "localhost", function(err, result) {
  if (err) {
    console.log(err);
  }

  console.log("Development Server Listening at http://localhost:8000");
});

open("http://localhost:8000")
