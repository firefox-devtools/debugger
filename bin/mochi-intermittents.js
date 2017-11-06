const shell = require("shelljs");
const _ = require("lodash");
const fs = require("fs");

/*
Mochi Intermittents is a small script for running the full mochitest
suite several times to look for intermittent failures.

There are two commands:
* run - runs the full suite N times
* uniqErrors - scans the logs for uniq test errors and their count

It is easy to pick up on trends by running `less logs`
and looking for `TEST-START <test-name>`
*/


function run(count) {
  fs.writeFileSync("logs", "");
  const headlessParam = headless ? '': `-- --setenv MOZ_HEADLESS=1`
  const cmd = `mochii --ci true --mc ./firefox --default-test-path devtools/client/debugger/new`;
  _.times(count).forEach(i => {
    console.log(`### RUN ${i}`);
    fs.appendFileSync("logs", `### RUN ${i}`);

    const out = shell.exec(cmd);
    fs.appendFileSync("logs", out.stdout);
    fs.appendFileSync("logs", out.stderr);
  });
}


function uniqErrors() {
  const text = fs.readFileSync("logs", "utf8")
  const errors = text.split("\n")
    .filter(line => line.includes("TEST-START"))
    .map(line => line.match(/TEST-START (.*)/)[1])

  const uniq_errors = _.uniq(errors)

  errorCounts = uniq_errors.map(error => ({
    error,
    count: errors.filter(e => e == error).length
  }))

  console.log(errors.length)
}

(() => {
  // run(50);
  // uniqErrors();
})()
