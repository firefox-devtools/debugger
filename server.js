"use strict";

const path = require("path");
const webpack = require("webpack");
const express = require("express");
const config = require("./webpack.config");
const webpackDevMiddleware = require("webpack-dev-middleware");

const app = express();
const compiler = webpack(config);

app.use("/js", express.static("js"));

app.use(webpackDevMiddleware(compiler, {
  publicPath: "/build",
  noInfo: true,
  stats: {
    colors: true
  }
}));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(8000, "localhost", function(err, result) {
  if (err) {
    console.log(err);
  }

  console.log("Listening at localhost:8000");
});
