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

exec(`./node_modules/.bin/mochii --read ./firefox/dbg_mochitest.log`);
exec(`./node_modules/.bin/mochii --read ./firefox/dt_mochitest.log`);
