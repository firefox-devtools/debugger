const shell = require("shelljs");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");
const _ = require("lodash");
const minimist = require("minimist");
const emoji = require("node-emoji");
const checkFileSizes = require("./checkFileSizes")

function exec(cmd) {
  const { stdout, stderr, code } = shell.exec(cmd, {
    silent: true
  });

  console.log(stdout);
  console.log(stderr);
  return code;
}


function copyAssets(path) {
  console.log(chalk.blue("Copying Assets"));
  const code = exec(`node ./bin/copy-assets.js --mc ${path}`);
  if (code !== 0) {
    process.exit(code);
  }
}

function runMochitests(pathOrTests) {
  const { code } = shell.exec(`./node_modules/.bin/mochii --ci --mc ./firefox --headless ${pathOrTests}`);
  return code === 0
}

const firefoxPath = "./firefox";
copyAssets(firefoxPath);
const fileSizeSuccess = checkFileSizes(firefoxPath);

console.log(chalk.blue("Running Tests"));
const dbgSuccess = runMochitests("devtools/client/debugger/new")

const otherTests = [
  "devtools/client/framework/test/browser_browser_toolbox_debugger.js",
  "devtools/client/framework/test/browser_keybindings_01.js",
  "devtools/client/framework/test/browser_toolbox_getpanelwhenready.js",
  "devtools/client/inspector/markup/test/browser_markup_links_06.js",
  "devtools/client/netmonitor/test/browser_net_open_in_debugger.js",
  "devtools/client/netmonitor/test/browser_net_view-source-debugger.js",
  "devtools/client/webconsole/new-console-output/test/mochitest/browser_jsterm_autocomplete_in_debugger_stackframe.js",
  "devtools/client/webconsole/new-console-output/test/mochitest/browser_webconsole_eval_in_debugger_stackframe1.js",
  "devtools/client/webconsole/new-console-output/test/mochitest/browser_webconsole_eval_in_debugger_stackframe2.js",
  "devtools/client/webconsole/new-console-output/test/mochitest/browser_webconsole_location_debugger_link.js",
  "devtools/client/webconsole/new-console-output/test/mochitest/browser_webconsole_stacktrace_location_debugger_link.js",
];

const dtSuccess = runMochitests(otherTests.join(" "))

const success = fileSizeSuccess && dbgSuccess && dtSuccess;
const code = success ? 0 : 1
process.exit(code);
