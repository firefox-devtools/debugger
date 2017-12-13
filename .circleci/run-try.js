const shell = require("shelljs");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");
const _ = require("lodash");
const minimist = require("minimist");
const emoji = require("node-emoji");

function exec(cmd) {
  return shell.exec(cmd, { silent: true });
}

shell.cd("firefox");
const tryRun = `./mach try -b do -p linux64,macosx64,win32,win64  -t none devtools/client/debugger/new`;
console.log(`Running try: ${chalk.dim(tryRun)}`);
const { output } = exec(tryRun);
console.log(output);
