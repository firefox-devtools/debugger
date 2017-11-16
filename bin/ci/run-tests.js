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

const fullFirefoxPath = path.join(process.cwd(), firefoxPath);
const testFile = fs.readFileSync(
  path.join(fullFirefoxPath, "devtools/client/debugger/new/debugger.js"),
  "utf8"
);
const lineCount = testFile.split("\n").length;

if (lineCount > 50000) {
  console.log(
    chalk.red(
      `Oh no, the bundle is ${lineCount} lines, which is greater than 50,000 lines`
    )
  );
  process.exit(1);
} else {
  console.log(
    chalk.yellow(
      `The bundle is ${lineCount} lines, which is not great, but fine...`
    )
  );
}

console.log(chalk.blue("Running Tests"));
const defaultPath = `--default-test-path devtools/client/debugger/new`;
const mcPath = `--mc ${firefoxPath}`;
code = exec(`./node_modules/.bin/mochii --ci true ${mcPath} ${defaultPath}`);
process.exit(code);
