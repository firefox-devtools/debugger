#!/usr/bin/env node

"use strict";
const config = require("../webpack.config");
const webpack = require("webpack");

webpack(config).run(function(_, stats) {
  if (stats.compilation.errors.length) {
    stats.compilation.errors.forEach(err => {
      console.log(err.message);
    });
    return;
  }

  console.log(stats.toString("normal"))
});
