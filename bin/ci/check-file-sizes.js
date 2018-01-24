const shell = require("shelljs");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");
const _ = require("lodash");
const minimist = require("minimist");
const emoji = require("node-emoji");

function exec(cmd) {
  const { stdout, stderr, code } = shell.exec(cmd, {
    silent: true
  });

  console.log(stdout);
  console.log(stderr);
  return code;
}

const firefoxPath = "./firefox";

const fileSizes = {
  "debugger.js": 50000,
  "parser-worker.js": 57000,
  "pretty-print-worker.js": 10000,
  "search-worker.js": 5000
};


function checkSize(key) {
  const fullFirefoxPath = path.join(process.cwd(), firefoxPath);
  const testFile = fs.readFileSync(
    path.join(fullFirefoxPath, `devtools/client/debugger/new/${key}`),
    "utf8"
  );
  const lineCount = testFile.split("\n").length;

  if (lineCount > fileSizes[key]) {
    console.log(
      chalk.red(
        `Oh no, ${key} is ${lineCount} lines, which is greater than ${
          fileSizes[key]
        } lines`
      )
    );
    return true;
  }

  console.log(
    chalk.yellow(
      `${key} is ${lineCount} lines, which is not great, but fine...`
    )
  );

  return false;
}

const failed = Object.keys(fileSizes)
  .map(key => checkSize(key))
  .some(fail => fail);

process.exit(failed ? 1 : 0)
