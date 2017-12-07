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

let code;
console.log(chalk.blue("Copying Assets"));
code = exec(`node ./bin/copy-assets.js --mc ${firefoxPath}`);
if (code !== 0) {
  process.exit(code);
}

const fileSizes = {
  "debugger.js": 50000,
  "parser-worker.js": 57000,
  "pretty-print-worker.js": 10000,
  "search-worker.js": 5000
};

Object.keys(fileSizes).forEach(key => {
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
    process.exit(1);
  } else {
    console.log(
      chalk.yellow(
        `${key} is ${lineCount} lines, which is not great, but fine...`
      )
    );
  }
});

console.log(chalk.blue("Running Tests"));
const defaultPath = `--default-test-path devtools/client/debugger/new`;
const mcPath = `--mc ${firefoxPath}`;
code = exec(`./node_modules/.bin/mochii --ci true ${mcPath} ${defaultPath}`);
process.exit(code);
