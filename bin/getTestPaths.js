"use strict";

const path = require("path");
const fs = require("fs");

function recursiveReaddirSync(dir) {
  let list = [];
  const files = fs.readdirSync(dir);

  files.forEach(function(file) {
    const stats = fs.lstatSync(path.join(dir, file));
    if (stats.isDirectory()) {
      list = list.concat(recursiveReaddirSync(path.join(dir, file)));
    } else {
      list.push(path.join(dir, file));
    }
  });

  return list;
}

function getTestPaths(dir) {
  const paths = recursiveReaddirSync(dir);

  return paths.filter(p => {
    const inTestDirectory = path.dirname(p).includes("test");
    const aHiddenFile = path.basename(p).charAt(0) == ".";
    return inTestDirectory && !aHiddenFile;
  });
}

module.exports = getTestPaths;
