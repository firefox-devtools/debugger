const shell = require("shelljs");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");
const _ = require("lodash");
const minimist = require("minimist");
const emoji = require("node-emoji");

const firefoxPath = "./firefox";

const otherTests = [
  "browser_net_open_in_debugger.js"
];

console.log(chalk.blue("Running Tests"));
const defaultPath = `devtools/client/debugger/new`;
const mcPath = `--mc ${firefoxPath}`;

shell.cd("firefox");

const dbg_mochitest = `./mach mochitest --headless --log-tbpl=dbg_mochitest.log ${defaultPath}`;
const dbg_out = shell.exec(dbg_mochitest, {});

const dt_mochitest = `./mach mochitest --headless --log-tbpl=dt_mochitest.log ${otherTests.join(" ")}`;
const dt_out = shell.exec(dt_mochitest, {});

if (dbg_out.code !== 0 || dt_out.code !== 0) {
  process.exit(dbg_out.code || dt_out.code);
}

process.exit(0);
