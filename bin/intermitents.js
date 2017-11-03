/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */
const shell = require("shelljs");
const chalk = require("chalk");
const path = require("path");
const _ = require("lodash");
const minimist = require("minimist");
const emoji = require("node-emoji");

/**
 * Checks for intermittents with one of two strategies:
 * 1. runs each test a number of times
 * 2. groups tests until failing tests are isolated
 *
 * params:
 *  --group enable test grouping
 *  --runs <number> set the number of test runs (default: 10)
 *  --path filters tests given a path
 */

const args = minimist(process.argv.slice(2), {
  boolean: ["group"],
  number: ["runs"],
  string: ["path"]
});

const runs = args.runs || 10;
const testPath = args.path ? `--testPathPattern ${args.path}` : "";
shell.env.PATH += `${path.delimiter}${__dirname}/../node_modules/jest-cli/bin`;
const child = shell.exec(`jest.js --listTests ${testPath}`, { silent: true });
const tests = JSON.parse(child.stdout);
const log = require("single-line-log").stdout;

const write = msg => process.stdout.write(msg);

function runTest(test) {
  const file = path.basename(test);
  log(`${emoji.get("sweat_smile")}  ${file} `);

  const startTime = Date.now();
  let failed = false;
  let elapsedTime = 0;
  let progress = [];
  _.times(runs).forEach(() => {
    const out = shell.exec(`jest.js ${test}`, { silent: true });
    const hasFailed = out.code !== 0;
    failed = failed || hasFailed;
    if (hasFailed) {
      console.log(out.stderr);
    }
    const endTime = Date.now();
    elapsedTime = Math.round((endTime - startTime) / 1000);
    if (failed) {
      progress.push(chalk.red("."));
    } else {
      progress.push(".");
    }
    const status = failed ? emoji.get("rage") : emoji.get("sweat_smile");
    const dots = progress.join("");
    log(`${status}  ${file} ${dots}`);
  });

  const dots = progress.join("");
  const status = failed ? emoji.get("rage") : emoji.get("sweat_smile");
  log(`${status}  ${file} ${dots} (${elapsedTime}s)`);
  console.log("");
  nextTest();
}

let queue = tests;
function nextTest() {
  const test = queue.pop();
  if (test) {
    runTest(test);
  }
}

function split(list) {
  return [list.slice(0, list.length / 2), list.slice(list.length / 2)];
}

function runTestGroup(tests) {
  const files = tests.map(test => path.basename(test)).join(", ");
  console.log(`${chalk.yellow(`starting`)}  ${files}`);

  const startTime = Date.now();
  shell.exec(
    `for i in \`seq 1 ${runs}\`; do jest ${tests.join(" ")}  ; done`,
    { silent: true },
    (code, stdout, stderr) => {
      const failed = stderr.match(/removeEvent/gi);
      const endTime = Date.now();
      const elapsedTime = Math.round((endTime - startTime) / 1000);
      if (failed) {
        console.log(`${chalk.red("failed")} (${elapsedTime}s) ${files}`);
        nextGroup(tests);
      } else {
        console.log(`${chalk.blue("passed")} (${elapsedTime}s) ${files}`);
      }
    }
  );
}

function nextGroup(_tests) {
  const [first, second] = split(_.shuffle(_tests));
  if (first.length > 0) {
    runTestGroup(first);
  }
  if (second.length > 0) {
    runTestGroup(second);
  }
}

if (args.group) {
  nextGroup(tests);
} else {
  // we start with 5 files so we don't overwhelm your computer
  new Array(5).fill().forEach(() => nextTest());
}
