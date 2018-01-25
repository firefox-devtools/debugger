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

const otherTests = [
  "browser_net_open_in_debugger.js"
];

console.log(chalk.blue("Running Tests"));
const defaultPath = `devtools/client/debugger/new`;
const mcPath = `--mc ${firefoxPath}`;

shell.cd("firefox");

const dbg_mochitest = `./mach mochitest --headless --log-tbpl=dbg_mochitest.log ${defaultPath}`;
const dbg_out = shell.exec(dbg_mochitest, { silent: true });

const dt_mochitest = `./mach mochitest --headless --log-tbpl=}}${otherTests.join(" ")}`;
const dt_out = shell.exec(dt_mochitest, { silent: true });

shell.cd("..")

exec(`./node_modules/.bin/mochii --read ./firefox/dbg_mochitest.log`);
exec(`./node_modules/.bin/mochii --read ./firefox/dt_mochitest.log`);

if (dbg_out.code !== 0 || dt_out.code !== 0) {
  process.exit(dbg_out.code || dt_out.code);
}

process.exit(0);
